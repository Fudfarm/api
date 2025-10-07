// import { dotenvConfig } from "./dotenv";
import { firebaseConfig } from "./firebase";

// type environment = "firebase" | "dotenv";

// const isFirebaseEnv: environment = "firebase";

// export const config =
//   isFirebaseEnv == "firebase" ? firebaseConfig : dotenvConfig;

export const config = firebaseConfig;
