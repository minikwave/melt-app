/**
 * Pages Router _error. next/document의 Html/Head/Main/NextScript를 사용하지 않음.
 * (사용 시 "Html should not be imported outside of pages/_document"로 /404·/500 프리렌더 실패)
 */
function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      {statusCode ? `오류 ${statusCode}` : '클라이언트 오류'}
    </div>
  );
}

Error.getInitialProps = ({ res, err }: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default Error;
