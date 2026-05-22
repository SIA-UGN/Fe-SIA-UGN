FLOW KERJA SETUP API SIA GLOBAL - LENGKAP
==========================================
Date: September 25, 2025
Author: GitHub Copilot

OVERVIEW SISTEM:
================
- Laravel 12 + Sanctum (token-based auth)
- Spatie Laravel Permission (role & permission)
- Roles: admin, manager, applicant, student
- Frontend terpisah menggunakan token

PENTING - STRUKTUR LARAVEL 12:
===============================
Laravel 12 memiliki struktur yang berbeda dari versi sebelumnya:
- Folder app/Http/Middleware TIDAK ADA secara default (perlu dibuat manual)
- Folder app/Http/Requests TIDAK ADA secara default (perlu dibuat manual)  
- Folder app/Http/Resources TIDAK ADA secara default (perlu dibuat manual)
- Folder app/Services TIDAK ADA secara default (perlu dibuat manual)
- Folder app/Exceptions TIDAK ADA secara default (perlu dibuat manual)
- Exception handling sekarang di bootstrap/app.php dengan withExceptions()
- Middleware registration di bootstrap/app.php dengan withMiddleware()

STRUKTUR DEFAULT LARAVEL 12:
app/
├── Http/
│   ├── Controllers/
├── Models/
├── Providers/

FLOW KERJA STEP BY STEP:
=========================

STEP 1: UPDATE MODEL USER
--------------------------
File: app/Models/User.php

```php
<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

STEP 2: BUAT AUTH CONTROLLER
----------------------------
File: app/Http/Controllers/Api/AuthController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register user baru
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign role applicant as default
        $user->assignRole('applicant');

        // Buat token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getPermissionsViaRoles()->pluck('name')
                ]
            ]
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Cek kredensial
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = User::where('email', $request->email)->first();
        
        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getPermissionsViaRoles()->pluck('name')
                ]
            ]
        ]);
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get current user info
     */
    public function user(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getPermissionsViaRoles()->pluck('name')
                ]
            ]
        ]);
    }

    /**
     * Refresh token (optional - untuk extend session)
     */
    public function refreshToken(Request $request)
    {
        $user = $request->user();
        
        // Revoke current token
        $request->user()->currentAccessToken()->delete();
        
        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Token refreshed successfully',
            'data' => [
                'access_token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }
}
```

STEP 3: UPDATE BASE CONTROLLER (HELPER METHODS)
------------------------------------------------
File: app/Http/Controllers/Controller.php

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Success response helper
     */
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $response = [
            'status' => 'success',
            'message' => $message,
        ];

        if (!is_null($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Error response helper
     */
    protected function errorResponse(string $message = 'Error occurred', int $statusCode = 400, $errors = null): JsonResponse
    {
        $response = [
            'status' => 'error',
            'message' => $message,
        ];

        if (!is_null($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Validation error response helper
     */
    protected function validationErrorResponse($errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->errorResponse($message, 422, $errors);
    }

    /**
     * Not found response helper
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Unauthorized response helper
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * Forbidden response helper
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }
}
```

STEP 4: SETUP API ROUTES
-------------------------
File: routes/api.php

```php
<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes - tidak perlu authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes - perlu authentication dengan Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    });
    
    // Admin only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Routes khusus admin akan ditambah nanti
    });
    
    // Manager routes
    Route::middleware('role:manager|admin')->prefix('manager')->group(function () {
        // Routes for manager and admin
    });
    
    // Applicant routes
    Route::middleware('role:applicant|student|manager|admin')->prefix('registration')->group(function () {
        // Routes for registration process
    });
    
    // Student routes
    Route::middleware('role:student|admin')->prefix('student')->group(function () {
        // Routes for students only
    });
});
```

STEP 5: BUAT ROLE PERMISSION SEEDER
------------------------------------
File: database/seeders/RolePermissionSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'manage_users',
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'create_manager_account',
            
            // Registration management
            'manage_registration',
            'view_registration',
            'approve_registration',
            'reject_registration',
            'submit_registration',
            'edit_registration',
            'view_registration_status',
            
            // Announcement management
            'manage_announcements',
            'view_announcements',
            
            // Profile management
            'view_own_profile',
            
            // System management
            'manage_system',
            'view_reports',
            'manage_roles',
            
            // Student permissions
            'access_student_portal',
            'view_academic_info',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // 1. Admin Role - Full access
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // 2. Manager Role - Manage registration and view users
        $managerRole = Role::create(['name' => 'manager']);
        $managerRole->givePermissionTo([
            'view_users',
            'manage_registration',
            'view_registration',
            'approve_registration',
            'reject_registration',
            'view_reports',
            'manage_announcements',
            'view_announcements',
            'view_own_profile',
        ]);

        // 3. Applicant Role - Submit and manage own registration
        $applicantRole = Role::create(['name' => 'applicant']);
        $applicantRole->givePermissionTo([
            'submit_registration',
            'edit_registration',
            'view_registration_status',
            'view_announcements',
            'view_own_profile',
        ]);

        // 4. Student Role - Access student portal (assigned when registration approved)
        $studentRole = Role::create(['name' => 'student']);
        $studentRole->givePermissionTo([
            'access_student_portal',
            'view_academic_info',
            'view_registration_status', // Keep this for history
            'view_announcements',
            'view_own_profile',
        ]);

        $this->command->info('Roles and permissions created successfully!');
        $this->command->info('Created roles: admin, manager, applicant, student');
        $this->command->info('Created ' . count($permissions) . ' permissions');
    }
}
```

STEP 6: BUAT USER SEEDER (DEFAULT USERS)
-----------------------------------------
File: database/seeders/UserSeeder.php

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@sia.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create Manager User
        $manager = User::create([
            'name' => 'System Manager',
            'email' => 'manager@sia.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $manager->assignRole('manager');

        // Create sample Applicant (for testing)
        $applicant = User::create([
            'name' => 'Test Applicant',
            'email' => 'applicant@test.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $applicant->assignRole('applicant');

        $this->command->info('Default users created successfully!');
        $this->command->info('Admin: admin@sia.com / password123');
        $this->command->info('Manager: manager@sia.com / password123');
        $this->command->info('Applicant: applicant@test.com / password123');
    }
}
```

STEP 7: UPDATE DATABASE SEEDER
-------------------------------
File: database/seeders/DatabaseSeeder.php

```php
<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Jalankan seeder untuk roles dan permissions terlebih dahulu
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
        ]);
    }
}
```

STEP 8: KONFIGURASI TOKEN EXPIRY (OPSIONAL)
--------------------------------------------

### A. Update Config Sanctum
File: config/sanctum.php

```php
<?php

return [
    // ...existing code...
    
    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes until an issued token will be
    | considered expired. If this value is null, personal access tokens do
    | not expire. This won't tweak the lifetime of first-party sessions.
    |
    */
    'expiration' => 60 * 24, // 24 jam (1440 minutes)
    
    // ...existing code...
];
```

### B. Cara Set Token Expiry di Controller
File: app/Http/Controllers/Api/AuthController.php (update method login dan register)

```php
// Di method register dan login, update bagian create token:
$token = $user->createToken('auth_token', ['*'], now()->addDay())->plainTextToken;

// Atau bisa juga dengan cara:
$token = $user->createToken(
    name: 'auth_token',
    abilities: ['*'],
    expiresAt: now()->addDay()
)->plainTextToken;
```

### C. Middleware untuk Check Token Expired (Laravel 12)

OPTION 1: BUAT FOLDER MIDDLEWARE MANUAL (RECOMMENDED)
Buat folder: app/Http/Middleware/
File: app/Http/Middleware/CheckTokenExpiry.php

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenExpiry
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $token = $request->user()->currentAccessToken();
            
            // Check if token is expired
            if ($token->expires_at && $token->expires_at->isPast()) {
                // Delete expired token
                $token->delete();
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token expired. Please login again.',
                    'error_code' => 'TOKEN_EXPIRED'
                ], 401);
            }
        }
        
        return $next($request);
    }
}
```

OPTION 2: GUNAKAN SANCTUM CONFIG (EASIER)
Cukup set expiration di config/sanctum.php tanpa middleware custom:

```php
// config/sanctum.php
'expiration' => 60 * 24, // 24 jam
```

OPTION 3: INLINE MIDDLEWARE PADA ROUTE
File: routes/api.php

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(function ($request, $next) {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $token = $request->user()->currentAccessToken();
            
            if ($token->expires_at && $token->expires_at->isPast()) {
                $token->delete();
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token expired. Please login again.',
                    'error_code' => 'TOKEN_EXPIRED'
                ], 401);
            }
        }
        
        return $next($request);
    })->group(function () {
        // Protected routes here
    });
});
```

### D. Register Middleware (Laravel 12) - JIKA MENGGUNAKAN OPTION 1

STEP 1: Buat folder middleware terlebih dahulu
```bash
mkdir app/Http/Middleware
```

STEP 2: Register di bootstrap/app.php
File: bootstrap/app.php

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register custom middleware aliases
        $middleware->alias([
            'check.token.expiry' => \App\Http\Middleware\CheckTokenExpiry::class,
        ]);
        
        // Atau tambahkan ke group api secara global:
        // $middleware->appendToGroup('api', [
        //     \App\Http\Middleware\CheckTokenExpiry::class,
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

STEP 3: Gunakan di routes (jika pakai alias)
File: routes/api.php

```php
Route::middleware(['auth:sanctum', 'check.token.expiry'])->group(function () {
    // Protected routes
});
```

### E. REKOMENDASI UNTUK LARAVEL 12

**PENDEKATAN TERMUDAH (RECOMMENDED):**
1. Gunakan konfigurasi Sanctum langsung di `config/sanctum.php`
2. Set token expiry saat create token di AuthController
3. Tidak perlu middleware custom

**CONTOH IMPLEMENTASI SEDERHANA:**

```php
// config/sanctum.php
'expiration' => 60 * 24, // 24 jam

// AuthController.php - method login/register
$token = $user->createToken(
    name: 'auth_token',
    abilities: ['*'],
    expiresAt: now()->addDay()
)->plainTextToken;
```

**JIKA BUTUH CUSTOM LOGIC:**
1. Buat folder `app/Http/Middleware` manual
2. Buat file middleware di dalamnya  
3. Register di `bootstrap/app.php`
4. Gunakan di routes

**TESTING TOKEN EXPIRY:**
```bash
# Set expiry pendek untuk testing (5 menit)
$token = $user->createToken('auth_token', ['*'], now()->addMinutes(5))->plainTextToken;
```

BEST PRACTICE IMPROVEMENTS:
============================

### A. Tambahkan Form Request Validation (Laravel 12)

**STEP 1: Buat folder Requests manual**
```bash
mkdir app/Http/Requests
mkdir app/Http/Requests/Auth
```

File: app/Http/Requests/Auth/RegisterRequest.php

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama harus diisi',
            'email.required' => 'Email harus diisi',
            'email.unique' => 'Email sudah terdaftar',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
        ];
    }
}
```

File: app/Http/Requests/Auth/LoginRequest.php

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email harus diisi',
            'email.email' => 'Format email tidak valid',
            'password.required' => 'Password harus diisi',
        ];
    }
}
```

### B. Tambahkan API Resource untuk Response Consistency (Laravel 12)

**STEP 1: Buat folder Resources manual**
```bash
mkdir app/Http/Resources
```

File: app/Http/Resources/UserResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'roles' => $this->getRoleNames(),
            'permissions' => $this->getPermissionsViaRoles()->pluck('name'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### C. Buat Service Class untuk Business Logic (Laravel 12)

**STEP 1: Buat folder Services manual**
```bash
mkdir app/Services
```

File: app/Services/AuthService.php

```php
<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Assign default role
        $user->assignRole('applicant');

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    public function login(array $credentials): array
    {
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = User::where('email', $credentials['email'])->first();
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    public function logout(User $user): bool
    {
        return $user->currentAccessToken()->delete();
    }

    public function refreshToken(User $user): string
    {
        // Revoke current token
        $user->currentAccessToken()->delete();
        
        // Generate new token
        return $user->createToken('auth_token')->plainTextToken;
    }
}
```

### D. Update Controller dengan Best Practices
File: app/Http/Controllers/Api/AuthController.php (Updated)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->register($request->validated());

            return $this->successResponse([
                'access_token' => $result['token'],
                'token_type' => 'Bearer',
                'user' => new UserResource($result['user'])
            ], 'User registered successfully', 201);

        } catch (\Exception $e) {
            return $this->errorResponse('Registration failed', 500);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());

            return $this->successResponse([
                'access_token' => $result['token'],
                'token_type' => 'Bearer',
                'user' => new UserResource($result['user'])
            ], 'Login successful');

        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout($request->user());
            
            return $this->successResponse(null, 'Successfully logged out');

        } catch (\Exception $e) {
            return $this->errorResponse('Logout failed', 500);
        }
    }

    public function user(Request $request): JsonResponse
    {
        return $this->successResponse([
            'user' => new UserResource($request->user())
        ]);
    }

    public function refreshToken(Request $request): JsonResponse
    {
        try {
            $token = $this->authService->refreshToken($request->user());

            return $this->successResponse([
                'access_token' => $token,
                'token_type' => 'Bearer'
            ], 'Token refreshed successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Token refresh failed', 500);
        }
    }
}
```

### E. Tambahkan Exception Handler (Laravel 12)

**OPTION 1: Buat folder Exceptions manual (jika butuh custom handler)**
```bash
mkdir app/Exceptions
```

File: app/Exceptions/Handler.php (Custom Handler)

```php
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        // Handle API exceptions
        if ($request->is('api/*')) {
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $exception->errors()
                ], 422);
            }

            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated'
                ], 401);
            }

            if ($exception instanceof AuthorizationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Forbidden'
                ], 403);
            }

            // Generic API error
            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong'
            ], 500);
        }

        return parent::render($request, $exception);
    }
}
```

**OPTION 2: Gunakan Exception Handler di bootstrap/app.php (RECOMMENDED)**
File: bootstrap/app.php

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle API exceptions
        $exceptions->render(function (ValidationException $exception, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $exception->errors()
                ], 422);
            }
        });

        $exceptions->render(function (AuthenticationException $exception, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated'
                ], 401);
            }
        });

        $exceptions->render(function (AuthorizationException $exception, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Forbidden'
                ], 403);
            }
        });
    })->create();
```

UPDATED FLOW KERJA ORDER (LARAVEL 12 - BEST PRACTICE):
========================================================

STEP 1: UPDATE MODEL USER ✓
STEP 2: BUAT FOLDER-FOLDER YANG DIPERLUKAN (NEW - LARAVEL 12)
        - mkdir app/Http/Requests
        - mkdir app/Http/Requests/Auth  
        - mkdir app/Http/Resources
        - mkdir app/Services
        - mkdir app/Http/Middleware (jika butuh custom middleware)
        - mkdir app/Exceptions (jika butuh custom exception handler)
STEP 3: BUAT FORM REQUEST VALIDATION (NEW)
STEP 4: BUAT API RESOURCE (NEW) 
STEP 5: BUAT SERVICE CLASS (NEW)
STEP 6: BUAT AUTH CONTROLLER (UPDATED)
STEP 7: UPDATE BASE CONTROLLER ✓
STEP 8: UPDATE EXCEPTION HANDLER (NEW - bootstrap/app.php)
STEP 9: SETUP API ROUTES ✓
STEP 10: BUAT ROLE PERMISSION SEEDER ✓
STEP 11: BUAT USER SEEDER ✓
STEP 12: UPDATE DATABASE SEEDER ✓
STEP 13: KONFIGURASI TOKEN EXPIRY (OPSIONAL) ✓

ADDITIONAL BEST PRACTICES (LARAVEL 12):
========================================

### F. Environment Configuration
File: .env (add these)

```env
# API Configuration
API_RATE_LIMIT=60
API_PREFIX=api/v1

# Sanctum Configuration  
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
SANCTUM_TOKEN_EXPIRY=1440

# Application
APP_TIMEZONE=Asia/Jakarta
```

### G. Laravel 12 Artisan Commands (Alternative to manual mkdir)
Meskipun folder tidak ada secara default, Anda tetap bisa menggunakan artisan:

```bash
# Buat middleware (akan membuat folder otomatis)
php artisan make:middleware CheckTokenExpiry

# Buat request (akan membuat folder otomatis)
php artisan make:request Auth/RegisterRequest
php artisan make:request Auth/LoginRequest

# Buat resource (akan membuat folder otomatis)
php artisan make:resource UserResource

# Buat service class (manual, artisan tidak punya command untuk service)
mkdir app/Services
# Lalu buat file AuthService.php manual

# Buat exception handler (akan membuat folder otomatis)
php artisan make:exception Handler
```

### H. Add API Versioning (Laravel 12)
File: routes/api.php (Updated)

```php
Route::prefix('v1')->group(function () {
    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Protected routes
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        // Auth routes
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
            Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
        });
        
        // Role-based routes...
    });
});
```

### I. Add Logging (Laravel 12)

**PASTIKAN FOLDER Services SUDAH DIBUAT**
```bash
mkdir app/Services
```

File: app/Services/AuthService.php (Add logging)

```php
use Illuminate\Support\Facades\Log;

public function register(array $data): array
{
    Log::info('User registration attempt', ['email' => $data['email']]);
    
    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => Hash::make($data['password']),
    ]);

    $user->assignRole('applicant');
    $token = $user->createToken('auth_token')->plainTextToken;

    Log::info('User registered successfully', ['user_id' => $user->id]);

    return ['user' => $user, 'token' => $token];
}
```

CARA IMPLEMENTASI (LARAVEL 12):
================================

0. BUAT FOLDER YANG DIPERLUKAN TERLEBIH DAHULU:
   mkdir app/Http/Requests
   mkdir app/Http/Requests/Auth
   mkdir app/Http/Resources  
   mkdir app/Services
   mkdir app/Http/Middleware
   mkdir app/Exceptions

1. JALANKAN MIGRATION:
   php artisan migrate

2. JALANKAN SEEDER:
   php artisan db:seed

3. SETUP TOKEN EXPIRY (OPSIONAL):
   - Update config/sanctum.php untuk set global expiry
   - Atau update controller untuk set expiry per token
   - Buat middleware CheckTokenExpiry jika perlu validasi manual
   - Update routes dengan middleware tambahan

4. TEST API:
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/auth/user (dengan token)
   - POST /api/auth/logout (dengan token)

API ENDPOINTS LENGKAP:
======================

1. REGISTER
   POST /api/auth/register
   Body: {
     "name": "John Doe",
     "email": "john@test.com", 
     "password": "password123",
     "password_confirmation": "password123"
   }

2. LOGIN
   POST /api/auth/login
   Body: {
     "email": "admin@sia.com",
     "password": "password123"
   }

3. GET USER INFO
   GET /api/auth/user
   Headers: Authorization: Bearer {token}

4. LOGOUT
   POST /api/auth/logout
   Headers: Authorization: Bearer {token}

5. REFRESH TOKEN
   POST /api/auth/refresh-token
   Headers: Authorization: Bearer {token}

DEFAULT USERS:
==============
1. admin@sia.com / password123 (role: admin)
2. manager@sia.com / password123 (role: manager)
3. applicant@test.com / password123 (role: applicant)

RESPONSE FORMAT:
================
Success Response:
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "access_token": "1|xyz...",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@sia.com", 
      "roles": ["admin"],
      "permissions": ["manage_users", "view_users", ...]
    }
  }
}

Error Response:
{
  "status": "error",
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}

FRONTEND INTEGRATION WITH TOKEN EXPIRY:
========================================

// Login Function dengan handling token expiry
async function login(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
        localStorage.setItem('auth_token', data.data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        
        // Set expiry time untuk frontend tracking
        const expiryTime = new Date();
        expiryTime.setTime(expiryTime.getTime() + (24 * 60 * 60 * 1000)); // 1 hari
        localStorage.setItem('token_expiry', expiryTime.getTime());
    }
    
    return data;
}

// Authenticated Request dengan auto refresh
async function makeAuthRequest(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    const expiryTime = localStorage.getItem('token_expiry');
    
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    // Check if token will expire in next 10 minutes
    const now = new Date().getTime();
    const timeUntilExpiry = expiryTime - now;
    const tenMinutes = 10 * 60 * 1000; // 10 menit dalam milliseconds
    
    if (timeUntilExpiry < tenMinutes && timeUntilExpiry > 0) {
        // Auto refresh token sebelum expired
        try {
            await refreshToken();
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // Redirect to login if refresh failed
            window.location.href = '/login';
            return;
        }
    }

    const headers = {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: headers
        });

        // Handle token expired response
        if (response.status === 401) {
            const errorData = await response.json();
            
            if (errorData.error_code === 'TOKEN_EXPIRED') {
                // Clear expired token
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('token_expiry');
                
                // Redirect to login
                window.location.href = '/login';
                throw new Error('Token expired. Please login again.');
            }
        }

        return response;
    } catch (error) {
        throw error;
    }
}

// Refresh Token Function
async function refreshToken() {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        throw new Error('No token to refresh');
    }
    
    const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
        // Update token dan expiry time
        localStorage.setItem('auth_token', data.data.access_token);
        
        const expiryTime = new Date();
        expiryTime.setTime(expiryTime.getTime() + (24 * 60 * 60 * 1000)); // 1 hari
        localStorage.setItem('token_expiry', expiryTime.getTime());
        
        return data;
    } else {
        throw new Error(data.message || 'Failed to refresh token');
    }
}

// Check if token is expired or will expire soon
function isTokenExpired() {
    const expiryTime = localStorage.getItem('token_expiry');
    
    if (!expiryTime) {
        return true; // No expiry time means no valid token
    }
    
    const now = new Date().getTime();
    return now >= parseInt(expiryTime);
}

// Set automatic token refresh (optional)
function setupAutoTokenRefresh() {
    setInterval(() => {
        const expiryTime = localStorage.getItem('token_expiry');
        const token = localStorage.getItem('auth_token');
        
        if (!token || !expiryTime) return;
        
        const now = new Date().getTime();
        const timeUntilExpiry = parseInt(expiryTime) - now;
        const thirtyMinutes = 30 * 60 * 1000; // 30 menit
        
        // Refresh token jika tinggal 30 menit sebelum expired
        if (timeUntilExpiry < thirtyMinutes && timeUntilExpiry > 0) {
            refreshToken().catch(error => {
                console.error('Auto refresh failed:', error);
                // Redirect to login on failure
                window.location.href = '/login';
            });
        }
    }, 5 * 60 * 1000); // Check setiap 5 menit
}

// Usage: Call this after successful login
// setupAutoTokenRefresh();

TOKEN EXPIRY CONFIGURATION OPTIONS:
===================================

1. GLOBAL EXPIRY (config/sanctum.php):
   'expiration' => 60 * 24,  // 24 jam
   'expiration' => 60 * 12,  // 12 jam  
   'expiration' => 60 * 2,   // 2 jam
   'expiration' => null,     // Never expire (default)

2. PER-TOKEN EXPIRY (di Controller):
   now()->addDay()          // 1 hari
   now()->addHours(12)      // 12 jam
   now()->addHours(2)       // 2 jam
   now()->addMinutes(30)    // 30 menit

3. REKOMENDASI UNTUK PRODUCTION:
   - Untuk aplikasi bisnis: 8-12 jam
   - Untuk aplikasi sensitif: 2-4 jam
   - Untuk public API: 1 hari
   - Dengan refresh token: bisa lebih pendek (1-2 jam)

KEAMANAN DENGAN TOKEN EXPIRY:
=============================

// Login Function
async function login(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
        localStorage.setItem('auth_token', data.data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
    }
    
    return data;
}

// Authenticated Request
async function makeAuthRequest(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    
    return fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
}

// Usage
const response = await makeAuthRequest('/api/auth/user');
const userData = await response.json();

NEXT STEPS:
===========
1. Create table for registration data
2. Create CRUD API for registration
3. Implement logic to upgrade applicant to student
4. Create custom middleware for permission checking
5. Create API to manage users (admin/manager)

PERMISSION HIERARCHY:
=====================
ADMIN:
- All permissions (full access)
- manage_users, view_users, create_users, edit_users, delete_users
- create_manager_account
- manage_registration, view_registration, approve_registration, reject_registration
- manage_announcements, view_announcements
- view_reports, manage_system, manage_roles
- view_own_profile

MANAGER:
- view_users (can view user list only)
- manage_registration, view_registration, approve_registration, reject_registration
- manage_announcements, view_announcements
- view_reports
- view_own_profile

APPLICANT:
- submit_registration, edit_registration, view_registration_status
- view_announcements
- view_own_profile

STUDENT:
- access_student_portal (placeholder for future features)
- view_academic_info
- view_registration_status (for history)
- view_announcements
- view_own_profile

FEATURE BREAKDOWN:
==================
ANNOUNCEMENTS:
- Public web page: Registration results (registration number, name)
- Applicant profile: Detailed status and information
- Email notification: Same content as profile page

USER MANAGEMENT:
- Admin: Full CRUD access to all users including managers
- Manager: Can only view user lists, no create/edit/delete access

ROLE TRANSITION:
- Applicant → Student (when registration approved)
- Project scope ends at registration completion

BUSINESS FLOW:
==============
1. User register -> automatically assigned "applicant" role
2. Applicant submits registration
3. Manager/Admin reviews registration
4. If approved -> role changes from "applicant" to "student"
5. Student can access student portal

KEAMANAN DENGAN TOKEN EXPIRY:
=============================
- Token expired otomatis mengurangi risiko jika token dicuri
- Frontend bisa auto-refresh token sebelum expired
- Middleware bisa validate dan cleanup expired tokens
- User experience tetap smooth dengan auto-refresh
- Admin bisa set expiry time sesuai kebutuhan keamanan aplikasi

=== END OF FLOW KERJA ===