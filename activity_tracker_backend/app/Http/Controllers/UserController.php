<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function index()
    {
        return response()->json(User::all());
    }

    public function show($user_id)
    {
        return response()->json(User::findOrFail($user_id));
    }

    public function update(Request $request, $user_id)
    {
        $user = User::findOrFail($user_id);

        $user->update($request->only(['name', 'email', 'department']));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    public function destroy($user_id)
    {
        User::findOrFail($user_id)->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
