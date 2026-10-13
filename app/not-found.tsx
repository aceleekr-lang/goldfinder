import Link from "next/link";
export default function NotFound() {
  return (<><h1>찾을 수 없는 페이지예요</h1><Link className="btn secondary" href="/">처음으로</Link></>);
}
