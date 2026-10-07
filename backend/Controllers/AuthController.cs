using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductManagement.Api.Data;
using ProductManagement.Api.Models;

namespace ProductManagement.Api.Controllers;

public record LoginDto(string Username, string Password);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _cfg;
    public AuthController(AppDbContext db, IConfiguration cfg) { _db = db; _cfg = cfg; }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Username and password are required.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username.Trim());
        var ok = user != null &&
                 new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, dto.Password)
                 != PasswordVerificationResult.Failed;
        if (!ok) return Unauthorized("Invalid username or password.");

        var expires = DateTime.UtcNow.AddHours(double.Parse(_cfg["Jwt:ExpireHours"]!));
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            _cfg["Jwt:Issuer"], _cfg["Jwt:Audience"],
            new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user!.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            },
            expires: expires,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            name = user.FullName,
            username = user.Username,
            expiresAt = expires
        });
    }
}
