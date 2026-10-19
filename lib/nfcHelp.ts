// 'NFC 켜는 법' 문구·그림 — 앱 안 도움말 창(NfcHelpFab)과 공개 페이지(/nfc)가 같이 쓴다 (2026-10-18 확정본).
//   문구를 고치면 둘 다 바뀐다. **굵게** 표시는 '눌러야 할 것'에만.
//   그림: public/nfc/<파일명>.png — 없으면 그림 없이 글만 보인다. 같은 이름으로 덮어쓰고 배포하면 바뀐 그림이 나온다
export const NFC_PAGE_URL = "https://goldfinder.mytourinfo.kr/nfc";
export const NFC_IMG_VER = process.env.NEXT_PUBLIC_ASSET_VER || "1";   // 배포마다 바뀌는 값 → 그림 캐시 자동 갱신

export type HelpBlock = {
  title: string;            // 소제목 (22px 이상)
  badge?: string;           // 소제목 옆 강조 (예: ← 꼭 확인하세요)
  intro?: string;           // 소제목 아래 한 줄
  img?: string;             // public/nfc/ 안 파일명
  steps?: string[];         // 번호 매김 — 한 줄에 한 동작
  note?: { title: string; lines: string[] };   // 회색 상자 보충 설명
};
export type HelpTab = { key: "android" | "iphone"; label: string; blocks: HelpBlock[] };

export const NFC_HELP = {
  title: "NFC 켜는 법",
  lead: ["별 표식에 휴대폰을 대도 아무 반응이 없나요?", "아래에서 내 휴대폰을 고르고, 순서대로 따라 해 보세요."],
  tabs: [
    { key: "android", label: "안드로이드 (갤럭시 등)", blocks: [
      { title: "① NFC 켜기", img: "nfc-android-quick.png", steps: [
          "화면 **맨 위**를 손가락으로 잡고 **아래로 두 번** 내려 주세요.",
          "버튼이 여러 개 보이면, **'NFC'** 라고 적힌 버튼을 찾아 **한 번 눌러** 주세요.",
          "버튼 색이 **밝게 바뀌면** 켜진 것입니다." ],
        note: { title: "NFC 버튼이 안 보이면", lines: [
          "설정(톱니바퀴) → 맨 위 **검색**에 `NFC` 입력 → **NFC** 를 눌러 켜 주세요.",
          "갤럭시는 설정 → **연결** → **NFC 및 비접촉 결제** 에 있어요." ] } },
      { title: "② '읽기·쓰기'도 켜져 있는지 확인", badge: "← 꼭 확인하세요", intro: "NFC를 켜도 **'결제만'** 되도록 되어 있으면 별 표식을 읽지 못합니다.", img: "nfc-android-mode.png", steps: [
          "NFC 버튼을 **꾹 누르면** 설정 화면이 열려요. (또는 위의 설정 화면)",
          "**'결제만' / '카드 모드'** 와 **'읽기·쓰기' / '기본 모드'** 가 따로 있으면 → **'읽기·쓰기(기본 모드)'** 가 켜져 있어야 합니다.",
          "둘 다 켤 수 있는 휴대폰은 **둘 다 켜 주세요.**" ] },
      { title: "③ 표식에 대기", img: "nfc-android-touch.png", steps: [
          "화면을 **켜고 잠금을 푼** 상태로 들고 계세요.",
          "휴대폰 **뒷면 가운데**를 별 표식의 **휴대폰 그림**에 **딱 붙여** 주세요.",
          "**2초 동안** 그대로 두세요. 화면이 바뀌면 성공입니다." ] },
    ] },
    { key: "iphone", label: "아이폰", blocks: [
      { title: "아이폰 XS 이후 (2018년 이후에 나온 아이폰)", intro: "따로 켤 것은 없습니다.", img: "nfc-iphone-touch.png", steps: [
          "화면을 **켜고 잠금을 푼** 상태로 들고 계세요.",
          "아이폰 **뒷면 윗부분(카메라 있는 쪽)** 을 별 표식의 **휴대폰 그림**에 **딱 붙여** 주세요.",
          "화면 **맨 위에 알림**이 뜨면, 그 알림을 **눌러** 주세요." ] },
      { title: "아이폰 7 ~ X (2016~2017년에 나온 아이폰)", img: "nfc-iphone-cc.png", steps: [
          "화면 오른쪽 위(또는 아래)에서 손가락으로 쓸어 **제어 센터**를 여세요.",
          "**'NFC 태그 리더기'** 버튼을 누른 뒤 표식에 대 주세요.",
          "버튼이 없으면: 설정 → 제어 센터 → **NFC 태그 리더기** 를 추가해 주세요." ],
        note: { title: "이럴 때는 아이폰이 표식을 못 읽어요", lines: [
          "· **카메라**가 켜져 있을 때 → 카메라를 닫아 주세요",
          "· **지갑(애플페이)** 화면이 열려 있을 때",
          "· **비행기 모드**일 때" ] } },
    ] },
  ] as HelpTab[],
  common: { title: "그래도 안 되면", lines: [
    "**두꺼운 케이스, 카드 넣는 케이스**는 빼고 대 보세요.",
    "대자마자 떼지 말고 **2초** 기다려 주세요. 위치를 조금씩 옮겨 보세요.",
    "아이폰은 **저전력 모드**도 꺼 보세요.",
    "표식 안의 **작은 QR**을 카메라로 찍어도 같은 화면이 열려요.",
    "그래도 어려우면 **시작 표식 옆 안내 요원**에게 휴대폰을 보여 주세요." ] },
  // 공개 페이지(/nfc)에만 붙는 줄
  pageTop: "영남루에 흩어진 별을 찾아라",
  pageBottom: "준비 끝! 이제 금찾기 시작 표식에 휴대폰을 대 보세요.",
  // A4 안내판(/nfc/print)
  print: { title: "휴대폰 NFC 켜는 법", lead: "별 표식에 휴대폰을 대도 반응이 없나요? QR을 찍어 내 휴대폰에 맞는 방법을 확인하세요.",
    scan: "카메라로 QR을 비춰 주세요",
    boxes: [
      { title: "안드로이드", body: "화면 위에서 두 번 내려 NFC 켜기, '읽기·쓰기'도 켜기" },
      { title: "아이폰 XS 이후", body: "켤 필요 없음 · 잠금 풀고 윗부분을 대고 알림 누르기" } ] },
};

/** 아이폰이면 'iphone', 그 밖에는 'android' (서버에서는 android) */
export function detectTab(): "android" | "iphone" {
  if (typeof navigator === "undefined") return "android";
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "iphone" : "android";
}
