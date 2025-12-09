<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ActivityUpdate;
use Illuminate\Validation\ValidationException;

class ActivityUpdateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    
    //Store new activity updates (single or multiple)
    
    public function store(Request $request)
    {
        $updates = $request->all();
        $created = [];

        // Wrap single object in array
        if (!isset($updates[0])) {
            $updates = [$updates];
        }

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        foreach ($updates as $data) {
            try {
                $validated = validator($data, [
                    'activity_id' => 'required|string|exists:activities,activity_id',
                    'status' => 'required|in:pending,done',
                    'remark' => 'nullable|string',
                    'progress' => 'nullable|string',
                ])->validate();

                // Generate unique update ID
                $prefix = strtoupper(substr($validated['activity_id'], 0, 2));
                do {
                    $updateId = $prefix . rand(100, 999);
                } while (ActivityUpdate::where('update_id', $updateId)->exists());

                // Create update
                $update = ActivityUpdate::create([
                    'update_id' => $updateId,
                    'activity_id' => $validated['activity_id'],
                    'updated_by' => $user->user_id,
                    'status' => $validated['status'],
                    'remark' => $validated['remark'] ?? null,
                    'progress' => $validated['progress'] ?? null,
                ]);

                // Update parent activity to match THIS update's status
                $activity = $update->activity;
                if ($activity) {
                    $activity->status = $validated['status']; // Always sync
                    $activity->save();
                }

                $created[] = $update;

            } catch (ValidationException $e) {
                Log::warning('Validation failed for activity update', [
                    'data' => $data,
                    'error' => $e->errors(),
                ]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            } catch (\Throwable $e) {
                Log::error('Failed to create activity update', [
                    'data' => $data,
                    'error' => $e->getMessage(),
                ]);
                return response()->json(['message' => 'Server error'], 500);
            }
        }

        return response()->json($created, 201);
    }

    
    // List all activity updates
    
    public function index()
    {
        return ActivityUpdate::with(['activity', 'user'])->get();
    }

    
    // Show a single activity update
    
    public function show($updateId)
    {
        return ActivityUpdate::with(['activity', 'user'])->findOrFail($updateId);
    }

    
    //Update existing activity update
     
    public function update(Request $request, $updateId)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,done',
                'remark' => 'nullable|string',
                'progress' => 'nullable|string',
            ]);

            $update = ActivityUpdate::findOrFail($updateId);
            $update->update($request->only('status', 'remark', 'progress'));

            // Directly mirror child status to parent
            $activity = $update->activity;
            if ($activity && $request->has('status')) {
                $activity->status = $update->status; // parent adopts child status
                $activity->save();
            }

            return $update;

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('ActivityUpdate update failed', [
                'error' => $e->getMessage(),
                'id' => $updateId,
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }



    //Report activity updates between dates
    public function report(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $from = \Carbon\Carbon::parse($request->from)->startOfDay();
        $to = \Carbon\Carbon::parse($request->to)->endOfDay();

        $updates = ActivityUpdate::with('activity', 'user')
            ->whereBetween('created_at', [$from, $to])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($updates);
    }
}
