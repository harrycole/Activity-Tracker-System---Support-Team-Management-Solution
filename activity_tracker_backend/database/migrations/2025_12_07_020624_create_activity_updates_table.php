<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_updates', function (Blueprint $table) {
            $table->string('update_id')->primary();  // custom string ID

            // activity link (string)
            $table->string('activity_id');
            $table->foreign('activity_id')->references('activity_id')->on('activities')->cascadeOnDelete();

            // user performing update (string)
            $table->string('updated_by');
            $table->foreign('updated_by')->references('user_id')->on('users')->cascadeOnDelete();

            $table->enum('status', ['done', 'pending']);
            $table->text('remark')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_updates');
    }
};
