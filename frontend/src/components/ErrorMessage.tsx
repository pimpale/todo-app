function ErrorMessage(props: {error: Error}) {
  return <>
    <p className="text-danger">{props.error.name}: <code>{props.error.message}</code></p>
    <p className="text-danger">Source: <code>{props.error.stack}</code></p>
  </>
}

export default ErrorMessage;
