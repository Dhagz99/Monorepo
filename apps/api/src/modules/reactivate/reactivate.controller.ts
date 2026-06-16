

// import { Request, Response } from "express";
// import { checkSelfReactivationEligibility, selfReactivateAgent } from "./reactivate.service";



// export async function checkReactivationController(
//   req: Request,
//   res: Response
// ) {
//   try {


//     const userId = (req as any).user.id


//     if (!userId) {
//       return res.status(400).json({
//         message: "No agent account linked.",
//       });
//     }

//     const result =
//       await checkSelfReactivationEligibility(
//         userId
//       );

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(500).json({
//       message:
//         error instanceof Error
//           ? error.message
//           : "Failed to check reactivation.",
//     });
//   }
// }

// export async function selfReactivateController(
//   req: Request,
//   res: Response
// ) {
//   try {
   
//     const userId = (req as any).user.id


//     if (!userId) {
//       return res.status(400).json({
//         message: "No agent account linked.",
//       });
//     }

//     const result =
//       await selfReactivateAgent(userId);

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(400).json({
//       message:
//         error instanceof Error
//           ? error.message
//           : "Failed to reactivate account.",
//     });
//   }
// }



import { Request, Response } from "express";

import {
  checkSelfReactivationEligibility,
  selfReactivateAgent,
} from "./reactivate.service";

export async function checkReactivationController(
  req: Request,
  res: Response
) {
  try {
    const userId =
      (req as any).user.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }

    const result =
      await checkSelfReactivationEligibility(
        userId
      );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to check reactivation.",
    });
  }
}

export async function selfReactivateController(
  req: Request,
  res: Response
) {
  try {
    const userId =
      (req as any).user.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }

    const result =
      await selfReactivateAgent(
        userId
      );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to reactivate account.",
    });
  }
}