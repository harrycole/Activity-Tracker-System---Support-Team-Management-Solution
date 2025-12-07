<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
  public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'department' => 'nullable|string|max:255', // Add this
        ]);
    
        // Generate user_id: first and last name initials + random 3 digits
        $nameParts = explode(' ', $request->name);
        $firstInitial = strtoupper(substr($nameParts[0], 0, 1));
        $lastInitial = strtoupper(substr(end($nameParts), 0, 1));
        
        do {
            $randomDigits = rand(100, 999);
            $userId = $firstInitial . $lastInitial . $randomDigits;
        } while(User::where('user_id', $userId)->exists());
    
        $user = User::create([
            'user_id' => $userId,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department' => $request->department, // Add this
        ]);
    
        // Create a Sanctum token for auto-login
        $token = $user->createToken('auth_token')->plainTextToken;
    
        return response()->json([
            'user' => $user,
            'token' => $token, // Optional: if you want to use token-based auth
        ], 201);
    }
  

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
