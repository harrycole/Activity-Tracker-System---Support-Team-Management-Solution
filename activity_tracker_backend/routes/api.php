<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityUpdateController;


use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    //Activities
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);

    Route::get('/activities/daily', [ActivityController::class, 'dailyActivities']);
    Route::get('/activities/hourly', [ActivityController::class, 'hourlyActivities']);



    // Activity Updates
    Route::post('/activity-updates', [ActivityUpdateController::class, 'store']);
    Route::get('/activity-updates', [ActivityUpdateController::class, 'index']);
    Route::get('/activity-updates/{id}', [ActivityUpdateController::class, 'show']);
    Route::put('/activity-updates/{id}', [ActivityUpdateController::class, 'update']);

    Route::get('/activity-updates/report', [ActivityUpdateController::class, 'report']);
});
