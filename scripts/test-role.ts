
import { Role } from "@prisma/client";
import { z } from "zod";

console.log("Role object:", Role);

const roleStr = "SUPER_ADMIN";
const RoleSchema = z.nativeEnum(Role);
const result = RoleSchema.safeParse(roleStr);

console.log("Validation result for 'SUPER_ADMIN':", result);

const invalidStr = "INVALID_ROLE";
const invalidResult = RoleSchema.safeParse(invalidStr);
console.log("Validation result for 'INVALID_ROLE':", invalidResult.success);
