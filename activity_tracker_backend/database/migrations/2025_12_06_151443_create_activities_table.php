<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;




return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('activities', function (Blueprint $table) {
        $table->id();  // Primary key
        $table->string('title');  // Activity title
        $table->text('description')->nullable();  // Optional description
        $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();  // Links to user
        $table->enum('status', ['done', 'pending'])->default('pending');  // Status of activity
        $table->timestamps();  // created_at and updated_at
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
