// Tests for shared/src/auth.ts
import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "shared";
import { z } from "zod";

const SPECIAL_CHARACTERS = "!@#$%^&*_-+=";

// Runs signupSchema with a valid name/email and the given password,
// and returns the password field's error messages (empty if valid).
const passwordErrors = (password: string): string[] => {
  const result = signupSchema.safeParse({
    name: "testName",
    email: "testEmail@test.com",
    password,
  });
  if (result.success) return [];
  return z.flattenError(result.error).fieldErrors.password ?? [];
};

describe("signupSchema validation", () => {
  it("should successfully parse of data with SignupSchema", () => {
    const validData = {
      name: "testName",
      email: "testEmail@test.com",
      password: "testPassword1!",
    };
    const result = signupSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it("Should fail parsing due to invalid email", () => {
    const invalidData = {
      name: "testName",
      email: "not-an-email",
      password: "testPassword1!",
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error);
      expect(errors.fieldErrors.email).toContain("Invalid email address");
    }
  });

  it("Should fail parsing due to invalid name", () => {
    const invalidData = {
      name: "",
      email: "testEmail@test.com",
      password: "testPassword1!",
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error);
      expect(errors.fieldErrors.name).toBeDefined();
    }
  });
});

describe("signup password rules", () => {
  it("accepts a password that meets every rule", () => {
    expect(passwordErrors("Password1!")).toEqual([]);
  });

  it.each([...SPECIAL_CHARACTERS])("accepts the special character %s", (char) => {
    expect(passwordErrors(`Passw0rd${char}`)).toEqual([]);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(passwordErrors("Pass1!a")).toContain("Password must be at least 8 characters");
  });

  it("accepts a password of exactly 8 characters", () => {
    expect(passwordErrors("Passw0r!")).toEqual([]);
  });

  it("rejects a password with no lowercase letter", () => {
    expect(passwordErrors("PASSWORD1!")).toContain("Password must contain a lowercase letter");
  });

  it("rejects a password with no uppercase letter", () => {
    expect(passwordErrors("password1!")).toContain("Password must contain an uppercase letter");
  });

  it("rejects a password with no number", () => {
    expect(passwordErrors("Password!!")).toContain("Password must contain a number");
  });

  it("rejects a password with no special character", () => {
    expect(passwordErrors("Password1")).toContain("Password must contain a special character");
  });

  it("rejects a password containing a space", () => {
    expect(passwordErrors("Pass word1!")).toContain(
      "Password can only contain letters, numbers, and !@#$%^&*_-+=",
    );
  });

  it.each(["~", "?", "/", "'", '"', "<", ">", "`", "\\", "|", ",", ".", ";", ":", "(", ")"])(
    "rejects the disallowed character %s",
    (char) => {
      expect(passwordErrors(`Passw0rd!${char}`)).toContain(
        "Password can only contain letters, numbers, and !@#$%^&*_-+=",
      );
    },
  );

  it("returns every failed rule when several apply", () => {
    const errors = passwordErrors("abc");
    expect(errors).toContain("Password must be at least 8 characters");
    expect(errors).toContain("Password must contain an uppercase letter");
    expect(errors).toContain("Password must contain a number");
    expect(errors).toContain("Password must contain a special character");
  });
});

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const validData = {
      email: "testEmail@test.com",
      password: "anyPassword",
    };
    const result = loginSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "anyPassword",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error);
      expect(errors.fieldErrors.email).toContain("Invalid email address");
    }
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "testEmail@test.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error);
      expect(errors.fieldErrors.password).toBeDefined();
    }
  });

  it("rejects a missing email", () => {
    const result = loginSchema.safeParse({ password: "anyPassword" });

    expect(result.success).toBe(false);
  });
});
