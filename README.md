# AI 캐릭터 대시보드

AI 캐릭터를 생성하고 관리할 수 있는 종합 대시보드 애플리케이션입니다. 사용자는 개인화된 AI 캐릭터를 만들고, 사용 현황을 추적하며, 효율적으로 관리할 수 있습니다.

## 🚀 주요 기능

### 📊 대시보드
- **실시간 통계**: 캐릭터 수, 총 사용량, 최근 활동 현황
- **시각적 차트**: 주간/월간 사용량 추이 분석
- **즐겨찾는 캐릭터**: 가장 많이 사용된 캐릭터 정보
- **최근 활동**: 최신 캐릭터 사용 기록

### 🎭 캐릭터 관리
- **캐릭터 생성**: 이름, 역할, 설명, 능력치 설정
- **능력 시스템**: 각 캐릭터에 2개의 능력과 수치 범위 설정
- **활성화 상태**: 캐릭터 활성화/비활성화 관리
- **검색 및 필터**: 이름, 역할, 상태별 캐릭터 검색
- **실시간 편집**: 모달을 통한 즉시 캐릭터 정보 수정

### 📈 사용 기록
- **상세 로그**: 모든 캐릭터 사용 활동 추적
- **필터링**: 날짜, 캐릭터, 활동 유형별 필터
- **통계 분석**: 사용 패턴 및 트렌드 분석
- **데이터 내보내기**: 사용 기록 데이터 내보내기

### 🔐 인증 시스템
- **안전한 로그인**: Supabase Auth 기반 사용자 인증
- **회원가입**: 이메일 인증을 통한 계정 생성
- **비밀번호 관리**: 비밀번호 찾기 및 변경 기능
- **세션 관리**: 자동 로그인 유지 및 보안 관리

## 🛠 기술 스택

### Frontend
- **Next.js 15**: App Router를 활용한 모던 React 프레임워크
- **TypeScript**: 타입 안정성을 위한 정적 타입 언어
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **shadcn/ui**: 모던하고 접근성이 뛰어난 UI 컴포넌트
- **Zustand**: 경량 상태 관리 라이브러리

### Backend & Database
- **Supabase**: 실시간 데이터베이스 및 인증 서비스
- **PostgreSQL**: 강력한 관계형 데이터베이스
- **Row Level Security**: 사용자별 데이터 보안

### Development Tools
- **ESLint**: 코드 품질 관리
- **Prettier**: 일관된 코드 포맷팅
- **TypeScript**: 컴파일 시간 타입 검사

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18.17 이상
- npm, yarn, pnpm 중 하나의 패키지 매니저
- Supabase 프로젝트

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd ai-character-dashboard
```

### 2. 의존성 설치
```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 데이터베이스 스키마 설정
Supabase 프로젝트에 다음 테이블들을 생성하세요:

#### `character` 테이블
```sql
create table character (
  id bigserial primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  role text,
  description text,
  ability1 text,
  ability1_min integer,
  ability1_max integer,
  ability2 text,
  ability2_min integer,
  ability2_max integer,
  images jsonb,
  user_id uuid references auth.users(id),
  is_active boolean default true,
  usage_count integer default 0,
  last_used timestamp with time zone
);
```

#### `statistics` 테이블
```sql
create table statistics (
  id bigserial primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  total_characters integer default 0,
  total_usage_count integer default 0,
  last_activity timestamp with time zone,
  favorite_character_id bigint references character(id),
  weekly_usage jsonb,
  monthly_usage jsonb
);
```

#### `logs` 테이블
```sql
create table logs (
  id bigserial primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  action_type text,
  character_id bigint references character(id),
  details jsonb,
  ip_address text,
  user_agent text
);
```

### 5. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📁 프로젝트 구조

```
116.ai_character_dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── characters/           # 캐릭터 관련 API
│   │   └── logs/                 # 로그 관련 API
│   ├── auth/                     # 인증 페이지들
│   ├── dashboard/                # 대시보드 메인
│   │   ├── character-settings/   # 캐릭터 설정 페이지
│   │   ├── usage-history/        # 사용 기록 페이지
│   │   └── components/           # 대시보드 컴포넌트
│   └── globals.css               # 글로벌 스타일
├── components/                   # 공통 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트
│   └── auth-*.tsx               # 인증 관련 컴포넌트
├── lib/                         # 유틸리티 및 설정
│   ├── supabase/                # Supabase 클라이언트 설정
│   ├── types.ts                 # TypeScript 타입 정의
│   └── utils.ts                 # 공통 유틸리티
└── middleware.ts                # Next.js 미들웨어
```

## 🔧 개발 가이드

### 코딩 컨벤션
- **라우팅**: Next.js App Router 사용
- **API**: Route Handler 우선 사용
- **상태 관리**: Zustand 활용
- **컴포넌트**: 기능별 모듈화, `components` 폴더 구조화
- **타입**: 페이지별 `types.ts` 파일로 관리
- **서버 컴포넌트**: 가능한 서버 컴포넌트 우선 사용

### API 엔드포인트
- `GET /api/characters` - 캐릭터 목록 조회
- `POST /api/characters` - 새 캐릭터 생성
- `PUT /api/characters/[id]` - 캐릭터 정보 수정
- `DELETE /api/characters/[id]` - 캐릭터 삭제
- `GET /api/logs` - 사용 기록 조회

## 🔒 보안

- **Row Level Security (RLS)**: 사용자별 데이터 접근 제어
- **인증 미들웨어**: 보호된 라우트 자동 리다이렉트
- **타입 안전성**: TypeScript를 통한 런타임 오류 방지
- **환경 변수**: 민감한 정보 환경 변수 관리

## 🚀 배포

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 완료

### 기타 플랫폼
- Netlify
- Railway
- AWS Amplify

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 GitHub Issues를 통해 연락해 주세요.

---

**AI 캐릭터 대시보드**로 나만의 AI 캐릭터 세계를 관리해보세요! 🎭✨
