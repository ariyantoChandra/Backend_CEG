const battleTable = {
  asam_kuat: {
    asam_kuat: "seri",
    asam_lemah: "menang",
    netral: "seri",
    basa_lemah: "menang",
    basa_kuat: "seri",
  },
  asam_lemah: {
    asam_kuat: "kalah",
    asam_lemah: "seri",
    netral: "kalah",
    basa_lemah: "seri",
    basa_kuat: "kalah",
  },
  netral: {
    asam_kuat: "menang",
    asam_lemah: "kalah",
    netral: "seri",
    basa_lemah: "kalah",
    basa_kuat: "menang",
  },
  basa_lemah: {
    asam_kuat: "kalah",
    asam_lemah: "seri",
    netral: "kalah",
    basa_lemah: "seri",
    basa_kuat: "kalah",
  },
  basa_kuat: {
    asam_kuat: "seri",
    asam_lemah: "menang",
    netral: "seri", //jangan lupa cek menang kalah lagi tunggu acara
    basa_lemah: "menang",
    basa_kuat: "seri",
  },
};

const reverseResult = (result) => {
  if (result === "menang") return "kalah";
  if (result === "kalah") return "menang";
  return "seri";
};

const checkBattleResult = (tim1, card1, tim2, card2) => {
  if (!battleTable[card1] || !battleTable[card1][card2]) {
    throw new Error("Jenis kartu tidak valid");
  }

  const resultCard1 = battleTable[card1][card2];
  const resultCard2 = reverseResult(resultCard1);

  return {
    tim1: tim1,
    result1: resultCard1,
    tim2: tim2,
    result2: resultCard2,
  };
};

export default checkBattleResult;
