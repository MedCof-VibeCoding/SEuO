import dns from "node:dns";
import mongoose from "mongoose";

import { env } from "~/env";

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConn?: typeof mongoose;
  mongoosePromise?: Promise<typeof mongoose>;
};

/**
 * DNS local (roteador/VPN) às vezes recusa consultas SRV do Atlas (ECONNREFUSED).
 * Prioriza IPv4 e adiciona resolvers públicos como fallback.
 */
function configureDnsForMongo(): void {
  dns.setDefaultResultOrder("ipv4first");
  const current = dns.getServers();
  const fallbacks = ["8.8.8.8", "1.1.1.1"];
  const merged = [...current];
  for (const fb of fallbacks) {
    if (!merged.includes(fb)) merged.push(fb);
  }
  dns.setServers(merged);
}

configureDnsForMongo();

const connectOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15_000,
  family: 4,
};

/**
 * URI de conexão: usa MONGODB_URI_STANDARD se definida (sem SRV), senão MONGODB_URI.
 */
function getMongoUri(): string {
  if (env.MONGODB_URI_STANDARD) {
    return env.MONGODB_URI_STANDARD;
  }
  return env.MONGODB_URI;
}

/**
 * Conecta ao MongoDB (singleton por processo).
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalForMongoose.mongooseConn) {
    return globalForMongoose.mongooseConn;
  }

  const uri = getMongoUri();

  globalForMongoose.mongoosePromise ??= mongoose.connect(uri, connectOptions).catch(
    async (err: unknown) => {
      globalForMongoose.mongoosePromise = undefined;
      const message = err instanceof Error ? err.message : String(err);
      const srvDnsFailure =
        message.includes("querySrv") ||
        message.includes("ECONNREFUSED") ||
        message.includes("ENOTFOUND");

      if (srvDnsFailure && uri.startsWith("mongodb+srv://") && !env.MONGODB_URI_STANDARD) {
        console.error(
          "[mongodb] Falha DNS SRV. Defina MONGODB_URI_STANDARD no .env (string padrão do Atlas) ou libere DNS 53 / use 8.8.8.8.",
        );
      }
      throw err;
    },
  );

  globalForMongoose.mongooseConn = await globalForMongoose.mongoosePromise;
  return globalForMongoose.mongooseConn;
}
