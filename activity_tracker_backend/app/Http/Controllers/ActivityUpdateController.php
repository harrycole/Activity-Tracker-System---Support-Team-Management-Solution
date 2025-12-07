<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ActivityUpdate;
use Carbon\Carbon;

class ActivityUpdateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Create new update
    public function store(Request $request)
    {
        $updates = $request->all(); // expect array of update objects
        $created = [];

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        foreach ($updates as $data) {
            $validated = validator($data, [
                'activity_id' => 'required|string|exists:activities,activity_id',
                'status' => 'required|in:pending,done',
                'remark' => 'nullable|string'
            ])->validate();

            $prefix = strtoupper(substr($validated['activity_id'], 0, 2));

            do {
                $updateId = $prefix . rand(100, 999);
            } while (\App\Models\ActivityUpdate::where('update_id', $updateId)->exists());

            $created[] = \App\Models\ActivityUpdate::create([
                'update_id' => $updateId,
                'activity_id' => $validated['activity_id'],
                'user_id' => $user->user_id,
                'status' => $validated['status'],
                'remark' => $validated['remark'] ?? null
            ]);
        }

        return response()->json($created, 201);
    }


    // Get all updates
    public function index()
    {
        return ActivityUpdate::with(['activity', 'user'])->get();
    }

    // Get single update
    public function show($updateId)
    {
        return ActivityUpdate::with(['activity', 'user'])->findOrFail($updateId);
    }

    // Update existing update
    public function update(Request $request, $updateId)
    {
        try {
            $request->validate([
                'status' => 'sometimes|in:pending,done',
                'remark' => 'nullable|string'
            ]);

            $update = ActivityUpdate::findOrFail($updateId);
            $update->update($request->only('status', 'remark'));

            return $update;

        } catch (\Throwable $e) {
            Log::error('ActivityUpdate update failed', [
                'error' => $e->getMessage(),
                'id' => $updateId
            ]);

            return response()->json(['message' => 'Server error'], 500);
        }
    }

    // Report by date range
    public function report(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $from = Carbon::parse($request->from)->startOfDay();
        $to = Carbon::parse($request->to)->endOfDay();

        $updates = ActivityUpdate::with('activity', 'user')
            ->whereBetween('created_at', [$from, $to])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($updates);
    }
}
