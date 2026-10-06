export type WritebackClientStatus = "created" | "queued" | "paused" | "failed";

export type WritebackClientResult = {
  status: WritebackClientStatus;
  externalRef?: string;
};

type WritebackPayload = {
  status?: string;
  queued?: boolean;
  externalRef?: string;
};

export function resolveWritebackResult(
  httpStatus: number,
  data: WritebackPayload
): WritebackClientResult {
  if (httpStatus >= 200 && httpStatus < 300 && data.status === "created" && data.externalRef) {
    return { status: "created", externalRef: data.externalRef };
  }
  if (httpStatus === 409 || data.queued) {
    return { status: "queued" };
  }
  if (httpStatus === 503) {
    return { status: "paused" };
  }
  return { status: "failed" };
}

export function writebackNote(result: {
  status: string;
  externalRef?: string;
}): string {
  if (result.status === "created" && result.externalRef) return result.externalRef;
  if (result.status === "paused") return "Paused. Nothing was sent.";
  if (result.status === "queued") return "Queued until Linear connects.";
  return "Failed. Nothing was sent.";
}
