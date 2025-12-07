<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $primaryKey = 'activity_id'; // custom primary key
    public $incrementing = false;          // not auto-increment
    protected $keyType = 'string';         // string type

    protected $fillable = [
        'activity_id',
        'title',
        'description',
        'created_by',
        'status',
    ];

    // Automatically generate activity_id before creating
    protected static function booted()
    {
        static::creating(function ($activity) {
            if (empty($activity->activity_id)) {
                $prefix = strtoupper(substr(preg_replace('/\s+/', '', $activity->title), 0, 2));
                do {
                    $id = $prefix . rand(100, 999);
                } while (self::where('activity_id', $id)->exists());
                $activity->activity_id = $id;
            }
        });
    }

    // Relation: Activity has many updates
    public function updates()
    {
        return $this->hasMany(ActivityUpdate::class, 'activity_id', 'activity_id');
    }

    // Relation: Activity created by a user
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }
}
