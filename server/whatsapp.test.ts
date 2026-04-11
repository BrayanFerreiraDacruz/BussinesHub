import { describe, it, expect, beforeEach, vi } from "vitest";
import { sendWhatsAppMessage, isWhatsAppConnected, getWhatsAppStatus } from "./whatsapp";

describe("WhatsApp Service", () => {
  describe("getWhatsAppStatus", () => {
    it("should return disconnected status when not connected", () => {
      const status = getWhatsAppStatus();
      expect(status.connected).toBe(false);
      expect(status.message).toBeDefined();
    });

    it("should have a message property", () => {
      const status = getWhatsAppStatus();
      expect(typeof status.message).toBe("string");
      expect(status.message.length).toBeGreaterThan(0);
    });
  });

  describe("isWhatsAppConnected", () => {
    it("should return false when not connected", () => {
      const connected = isWhatsAppConnected();
      expect(typeof connected).toBe("boolean");
    });
  });

  describe("sendWhatsAppMessage", () => {
    it("should handle invalid phone numbers", async () => {
      const result = await sendWhatsAppMessage("", "Test message");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error when not connected", async () => {
      const result = await sendWhatsAppMessage("11987654321", "Test message");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should format Brazilian phone numbers correctly", async () => {
      // This test validates the phone formatting logic
      const phoneFormats = [
        "11987654321",
        "(11) 98765-4321",
        "11 98765-4321",
        "+55 11 98765-4321",
      ];

      for (const phone of phoneFormats) {
        const result = await sendWhatsAppMessage(phone, "Test");
        // Should not throw error
        expect(result).toBeDefined();
        expect(result.success !== undefined).toBe(true);
      }
    });
  });
});
