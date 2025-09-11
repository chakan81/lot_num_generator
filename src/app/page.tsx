export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            로또 번호 생성기
          </h1>
          <p className="text-lg text-green-600 mb-8">
            6개의 로또 번호를 개별 범위 설정으로 생성해보세요
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600">
              프로젝트 초기화 완료! 곧 슬라이더와 번호 생성 기능이 추가됩니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}