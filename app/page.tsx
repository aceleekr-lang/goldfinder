import { OP_HOURS, RSV_URL } from "@/lib/copy";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="story" style={{ margin: "0 0 12px" }}><img src="/img/home.webp" alt="영남루에 흩어진 별을 찾아라" style={{ width: "100%", borderRadius: 12, display: "block" }} /></div>
      <div className="card">
        <p>정원에 흩어진 5가지 빛깔의 별을 깨워 나만의 영남루 별자리를 완성해 보세요.</p>
        <p className="muted">정원 안 <b>시작 표식</b>에 휴대폰을 대면 참여가 시작됩니다. NFC가 되지 않으면 표식의 QR을 기본 카메라로 찍어 주세요.</p>
        <p className="muted">운영: {OP_HOURS}</p>
        <p className="muted"><b>금찾기는 100% 사전예약제</b>(당일 예약 불가)입니다. 매표소에서 별빛정원 입장권(유료)을 사서 일반 관람객과 같은 입구로 들어온 뒤, 정원 안 시작 표식을 태그하고 <b>본인 예약번호</b>를 입력하면 시작돼요. 예약은 참여 예약일 뿐 입장권이 아니며, 예약자 전용 입구는 없습니다. <a href={RSV_URL} target="_blank" rel="noreferrer">예약·예약 조회</a> · 참여는 1인 1일 1회</p>
      </div>
      <Link className="btn secondary" href="/recover">참여번호로 이어서 하기</Link>
      <Link className="btn secondary" href="/s">내 별자리 보기</Link>
    </>
  );
}
