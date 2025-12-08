<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\ActivityUpdate;

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

    // Update existing activity
    public function update(Request $request, $activityId)
    {
        try {
            $activity = Activity::findOrFail($activityId);

            $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:pending,done',
            ]);

            $activity->update($request->only('title', 'description', 'status'));

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

    // Daily activities with updates
    public function dailyActivities(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $date = Carbon::parse($request->date)->format('Y-m-d');

        $activities = Activity::with(['updates' => function($q) use ($date) {
                $q->whereDate('created_at', $date)
                  ->orderBy('created_at', 'asc'); // updates chronological
            }, 'creator'])
            ->whereDate('created_at', $date)   // only activities from that date
            ->orderBy('created_at', 'desc')    // newest first
            ->get();

        return response()->json($activities);
    }


    // Hourly activities with updates
    public function hourlyActivities(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $date = Carbon::parse($request->date)->format('Y-m-d');

        $updates = ActivityUpdate::with('activity', 'user')
        ->whereHas('activity', function($q) use ($date) {
            $q->whereDate('created_at', $date);
        })
        ->whereDate('created_at', $date)
        ->orderBy('created_at', 'asc')
        ->get()
        ->groupBy(fn($item) => Carbon::parse($item->created_at)->format('H'));

        return response()->json($updates);
    }
}
