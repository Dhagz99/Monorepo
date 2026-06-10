import { DirectCommissionParams } from "@repo/shared";

export const calculateDirectCommission = ({
  treshold,
  formulaType,
  installmentAmount,
  term,
  piraRate,
}: DirectCommissionParams) => {

  const computedAmount =
    (
      installmentAmount *
      term *
      (piraRate / 100)
    ) /
    12 *
    term;

  switch (formulaType) {

    case "FORMULA3":
        return computedAmount;


    case "FORMULA4":
      return Math.max(
        computedAmount, 
        treshold
    ) ;

    default:
      throw new Error(
        "Unknown formula"
      );
  }
};