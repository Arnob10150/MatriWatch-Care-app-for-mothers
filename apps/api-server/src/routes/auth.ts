import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, staffTable, mothersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendServerError } from "../lib/http-errors";
import { createHash, randomBytes } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(salt + password).digest("hex");
}

function createPasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  return hashPassword(password, salt) === hash;
}

// POST /auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const { name, email, password, role, age, gestational_age, due_date, clinic_id } = req.body as {
      name: string;
      email: string;
      password: string;
      role: "Doctor" | "Nurse" | "Mother";
      age?: number;
      gestational_age?: number;
      due_date?: string;
      clinic_id?: string;
    };

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "name, email, password and role are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const validRoles = ["Doctor", "Nurse", "Mother"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: `role must be one of: ${validRoles.join(", ")}` });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const dbRole = role === "Mother" ? "mother" : "clinic_staff";
    const passwordHash = createPasswordHash(password);

    const [user] = await db
      .insert(usersTable)
      .values({ email, name, role: dbRole, passwordHash })
      .returning();

    let profileId: string | null = null;

    if (role === "Mother") {
      if (!age) {
        res.status(400).json({ error: "age is required for Mother registration" });
        return;
      }
      const [mother] = await db
        .insert(mothersTable)
        .values({
          userId: user.id,
          name,
          age,
          gestationalAge: gestational_age ?? null,
          clinicId: clinic_id ?? null,
          dueDate: due_date ?? null,
        })
        .returning();
      profileId = mother.id;
    } else if (role === "Doctor" || role === "Nurse") {
      const [staff] = await db
        .insert(staffTable)
        .values({
          userId: user.id,
          name,
          role: role === "Doctor" ? "doctor" : "nurse",
          clinicId: clinic_id ?? null,
        })
        .returning();
      profileId = staff.id;
    }

    res.status(201).json({
      id: user.id,
      profile_id: profileId,
      name,
      email: user.email,
      role,
      created_at: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to register user");
    sendServerError(res, err);
  }
});

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Determine UI role (Doctor vs Nurse from staff table)
    let finalRole: string =
      user.role === "admin" ? "Admin" : user.role === "mother" ? "Mother" : "clinic_staff";

    if (user.role === "clinic_staff") {
      const [staff] = await db
        .select()
        .from(staffTable)
        .where(eq(staffTable.userId, user.id))
        .limit(1);
      if (staff?.role) {
        finalRole = staff.role.charAt(0).toUpperCase() + staff.role.slice(1);
      }
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: finalRole,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to login");
    sendServerError(res, err);
  }
});

export default router;
