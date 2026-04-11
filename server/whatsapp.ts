import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import path from "path";

let sock: any = null;
let isConnecting = false;

const authDir = path.join(process.cwd(), ".wwebjs_auth");

/**
 * Inicializar conexão WhatsApp com Baileys
 */
export async function initWhatsApp() {
  if (sock) return sock;
  if (isConnecting) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (sock) {
          clearInterval(checkInterval);
          resolve(sock);
        }
      }, 1000);
    });
  }

  isConnecting = true;

  try {
    // Criar diretório de autenticação se não existir
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    // Salvar credenciais quando atualizadas
    sock.ev.on("creds.update", saveCreds);

    // Lidar com desconexão
    sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log(
          "connection closed due to ",
          lastDisconnect?.error,
          ", reconnecting ",
          shouldReconnect
        );

        if (shouldReconnect) {
          sock = null;
          isConnecting = false;
          setTimeout(() => initWhatsApp(), 3000);
        }
      } else if (connection === "open") {
        console.log("✓ WhatsApp conectado com sucesso!");
        isConnecting = false;
      }
    });

    return sock;
  } catch (error) {
    console.error("Erro ao inicializar WhatsApp:", error);
    isConnecting = false;
    throw error;
  }
}

/**
 * Enviar mensagem de WhatsApp
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const whatsapp = await initWhatsApp();

    if (!whatsapp) {
      return {
        success: false,
        error: "WhatsApp não conectado. Escaneie o QR code primeiro.",
      };
    }

    // Formatar número para formato WhatsApp (adicionar @s.whatsapp.net)
    let formattedNumber = phoneNumber.replace(/\D/g, "");
    if (!formattedNumber.startsWith("55")) {
      formattedNumber = "55" + formattedNumber;
    }
    const jid = formattedNumber + "@s.whatsapp.net";

    // Enviar mensagem
    const response = await (whatsapp as any).sendMessage(jid, { text: message });

    return {
      success: true,
      messageId: response.key.id,
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Verificar se WhatsApp está conectado
 */
export function isWhatsAppConnected(): boolean {
  return (sock as any)?.user !== undefined;
}

/**
 * Obter status da conexão
 */
export function getWhatsAppStatus(): {
  connected: boolean;
  phoneNumber?: string;
  message: string;
} {
  if (!sock) {
    return {
      connected: false,
      message: "WhatsApp não inicializado. Escaneie o QR code.",
    };
  }

  if (!(sock as any).user) {
    return {
      connected: false,
      message: "WhatsApp conectando... Escaneie o QR code no terminal.",
    };
  }

  return {
    connected: true,
    phoneNumber: (sock as any).user.id.split(":")[0],
    message: "WhatsApp conectado com sucesso!",
  };
}

/**
 * Desconectar WhatsApp
 */
export async function disconnectWhatsApp(): Promise<void> {
  if (sock) {
    await sock.logout();
    sock = null;
  }
}
