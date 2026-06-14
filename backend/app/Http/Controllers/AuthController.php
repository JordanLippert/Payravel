<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * @group Authentication
     * @unauthenticated
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = array_merge([
            'currency' => 'EUR',
            'country'  => '',
        ], array_filter($request->validated(), fn($v) => $v !== null));

        $user  = User::create($data);
        $token = $user->createToken('auth')->accessToken;

        return response()->json([
            'data'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * @group Authentication
     * @unauthenticated
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!auth()->attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = auth()->user()->createToken('auth')->accessToken;

        return response()->json([
            'data'  => new UserResource(auth()->user()),
            'token' => $token,
        ]);
    }

    /**
     * @group Authentication
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->token()->revoke();

        return response()->json(['message' => 'Logged out successfully.']);
    }


}
