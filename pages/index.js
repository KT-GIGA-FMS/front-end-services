import Link from 'next/link';
import Header from '../components/Header';

export default function HomePage() {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px' }}>
        <h1>환영합니다!</h1>
        <p>프론트엔드 애플리케이션에 오신 것을 환영합니다.</p>
        
        <div style={{ marginTop: '30px' }}>
          <h2>서비스 목록</h2>
          <ul>
            <li>
              <Link href="/userservice">
                <a style={{ color: '#0070f3', textDecoration: 'none' }}>
                  👥 사용자 서비스
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
