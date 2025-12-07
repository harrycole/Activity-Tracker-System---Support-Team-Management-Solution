<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->string('activity_id')->primary();        // string ID
            $table->string('title');
            $table->text('description')->nullable();

            // created_by MUST be string because user_id is a string
            $table->string('created_by');
            $table->foreign('created_by')->references('user_id')->on('users')->cascadeOnDelete();

            $table->enum('status', ['done', 'pending'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
