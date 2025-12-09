<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ActivityController extends Controller
{
    // Create activity
    public function store(Request $request)
    {
        $activities = $request->all(); // expect array of objects
        $created = [];

        foreach ($activities as $data) {
            $validated = validator($data, [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
            ])->validate();

            $user = $request->user();

            $created[] = Activity::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'created_by' => $user->user_id,
                'status' => 'pending',
            ]);
        }

        return response()->json($created, 201);
    }

    // Get all activities
    public function index()
    {
        $activities = Activity::with('creator', 'updates')->get();
        return response()->json($activities);
    }

    // Get single activity
    public function show($activityId)
    {
        $activity = Activity::with('creator', 'updates')->findOrFail($activityId);
        return response()->json($activity);
    }

    // Update activity
    public function update(Request $request, $activityId)
    {
        try {
            $activity = Activity::findOrFail($activityId);

            $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:pending,done',
            ]);

            $oldStatus = $activity->status; // Store old status
            
            $activity->update($request->only('title', 'description', 'status'));

            // If status changed, create an activity_update record
            if ($request->has('status') && $activity->status !== $oldStatus) {
                ActivityUpdate::create([
                    'update_id' => 'UPD'.rand(10000,99999),
                    'activity_id' => $activity->activity_id,
                    'updated_by' => $request->user()->user_id,
                    'status' => $activity->status,
                    'remark' => $request->input('remark', 'Status changed via parent update'),
                    'progress' => $request->input('progress', null),
                ]);
            }

            return response()->json($activity);

        } catch (\Exception $e) {
            Log::error('Activity update failed', [
                'error' => $e->getMessage(),
                'activity_id' => $activityId,
                'input' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to update activity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function weeklyActivities()
    {
        // Ensure we are in UTC to match DB timestamps
        $startOfWeek = Carbon::now('UTC')->startOfWeek(Carbon::MONDAY)->startOfDay();
        $endOfWeek = Carbon::now('UTC')->endOfWeek(Carbon::SUNDAY)->endOfDay();
    
        // Fetch all activities in one query
        $activities = Activity::with(['updates', 'creator'])
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->orderBy('created_at', 'asc')
            ->get();
    
        // Group activities by day (Y-m-d)
        $weeklyActivities = $activities->groupBy(function($activity) {
            return Carbon::parse($activity->created_at)->format('Y-m-d');
        });
    
        return response()->json($weeklyActivities);
    }
    

    // Daily activities with updates
public function dailyActivities(Request $request)
{
    $request->validate([
        'date' => 'required|date'
    ]);

    $date = Carbon::parse($request->date)->format('Y-m-d');

    // Get activities created on the given date, with updates and creator
    $activities = Activity::with([
            'updates' => function($q) {
                $q->orderBy('created_at', 'asc');
            },
            'creator' // This will load the user relationship
        ])
        ->whereDate('created_at', $date)
        ->orderBy('created_at', 'asc')
        ->get();

    // Format activities with nested updates
    $dailyActivities = $activities->map(function($activity) {
        return [
            'activity_id' => $activity->activity_id,
            'title' => $activity->title ?? null,
            'description' => $activity->description ?? null,
            'status' => $activity->status ?? 'pending', // Get status from activity table
            'created_at' => $activity->created_at,
            'creator' => $activity->creator ? [
                'name' => $activity->creator->name ?? 'Unknown',
                'department' => $activity->creator->department ?? 'General'
            ] : [
                'name' => 'Unknown',
                'department' => 'General'
            ], // Get creator info from user table
            'updates' => $activity->updates->map(function($update) {
                return [
                    'update_id' => $update->update_id,
                    'progress' => $update->progress,
                    'status' => $update->status,
                    'remark' => $update->remark,
                    'created_at' => $update->created_at,
                ];
            }),
        ];
    });

    return response()->json($dailyActivities);
}
    

}
