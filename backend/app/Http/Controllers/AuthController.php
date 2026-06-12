<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

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

    /**
     * @group Authentication
     * @unauthenticated
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Email not registered. Please sign up.'], 422);
        }

        return response()->json(['message' => 'Password reset link sent to your email.']);
    }

    /**
     * @group Authentication
     * @unauthenticated
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->update(['password' => $password]);
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
