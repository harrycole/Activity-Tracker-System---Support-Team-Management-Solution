<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityUpdate extends Model
{
    protected $table = 'activity_updates';
    protected $primaryKey = 'update_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'update_id',
        'activity_id',
        'user_id',
        'status',
        'remark',
    ];

    // Generate update_id automatically
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->update_id) {
                $model->update_id = 'UPD' . random_int(10000, 99999);
            }
        });
    }

    // Relationships
    public function activity()
    {
        return $this->belongsTo(Activity::class, 'activity_id', 'activity_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
