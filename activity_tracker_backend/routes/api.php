<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityUpdateController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);

    // Users
    Route::get('/user', [UserController::class, 'me']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Activities
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::post('/activities-daily', [ActivityController::class, 'dailyActivities']);
    Route::get('/activities-weekly', [ActivityController::class, 'weeklyActivities']);

    // Activity Updates
    Route::post('/activity-updates', [ActivityUpdateController::class, 'store']);
    Route::get('/activity-updates', [ActivityUpdateController::class, 'index']);
    Route::get('/activity-updates/{id}', [ActivityUpdateController::class, 'show']);
    Route::put('/activity-updates/{id}', [ActivityUpdateController::class, 'update']);
    Route::get('/activity-updates/report', [ActivityUpdateController::class, 'report']);
});
