import { ClientInstanceConfig } from "shared-lib/types/ClientInstanceConfig";

export type PinbotInstanceConfig = ClientInstanceConfig & {
	deployInteractions: boolean;
};