<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::where('user_id', $request->user()->id)->latest();

        if ($filter = $request->query('filter')) {
            if ($filter === 'unread') $query->unread();
            if ($filter === 'read')   $query->read();
        }

        return response()->json($query->paginate(15));
    }

    public function recent(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(3)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => Notification::where('user_id', $request->user()->id)
                ->unread()
                ->count(),
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['read_at' => now()]);

        return response()->json(['data' => $notification]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
