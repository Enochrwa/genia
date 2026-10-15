import { z } from "zod";

export const LOCALES = ["rw", "en", "fr"] as const;
export const LocaleSchema = z.enum(LOCALES);

/** Raw phone input; the server normalises it to E.164. Accepts local Rwandan format (07xxxxxxxx). */
export const PhoneInputSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^[+0-9 ()-]+$/, "phone may only contain digits, spaces, +, - and parentheses");

export const OtpRequestSchema = z.object({
  phone: PhoneInputSchema,
  locale: LocaleSchema.optional(),
});
export type OtpRequest = z.infer<typeof OtpRequestSchema>;

export const OtpVerifySchema = z.object({
  phone: PhoneInputSchema,
  code: z.string().regex(/^\d{6}$/, "code must be 6 digits"),
  /** Required when the phone number is new: declares the user is 18 or older. */
  ageConfirmed: z.boolean().optional(),
  deviceId: z.string().trim().min(8).max(128).optional(),
  locale: LocaleSchema.optional(),
});
export type OtpVerify = z.infer<typeof OtpVerifySchema>;

export const RefreshSchema = z.object({ refreshToken: z.string().min(20).max(200) });
export type RefreshRequest = z.infer<typeof RefreshSchema>;

export const PinSchema = z.string().regex(/^\d{4,6}$/, "PIN must be 4 to 6 digits");
export const SetPinSchema = z.object({ pin: PinSchema });
export const ChangePinSchema = z.object({ currentPin: PinSchema, newPin: PinSchema });
export const VerifyPinSchema = z.object({ pin: PinSchema });

export const UpdateProfileSchema = z
  .object({
    locale: LocaleSchema.optional(),
    email: z.string().trim().toLowerCase().email().max(254).nullable().optional(),
  })
  .refine((v) => v.locale !== undefined || v.email !== undefined, {
    message: "at least one field is required",
  });
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const USER_STATUSES = ["ACTIVE", "SUSPENDED", "SELF_EXCLUDED", "CLOSED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface UserDto {
  id: string;
  phone: string;
  country: string;
  locale: (typeof LOCALES)[number];
  email: string | null;
  status: UserStatus;
  kycLevel: number;
  hasPin: boolean;
  createdAt: string;
}

export interface AuthTokensDto {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
  user: UserDto;
  isNewUser: boolean;
}

export interface OtpRequestedDto {
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

export interface SessionDto {
  id: string;
  deviceId: string | null;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

export type SetPin = z.infer<typeof SetPinSchema>;
export type ChangePin = z.infer<typeof ChangePinSchema>;
export type VerifyPin = z.infer<typeof VerifyPinSchema>;
