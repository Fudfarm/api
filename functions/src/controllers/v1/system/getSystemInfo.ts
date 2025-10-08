import { SystemInfo } from "../../../models/v1/SystemInfo";
/**
 * Retrieves the existing SystemInfo document or creates a new one if it doesn't exist.
 * @return {Promise<SystemInfo>} The existing SystemInfo document or a newly created one.
 */
export async function getOrCreateSystemInfo() {
  let info = await SystemInfo.findOne();
  if (!info) {
    info = new SystemInfo({});
    await info.save();
  }
  return info;
}
