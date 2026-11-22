export default function IssueReportMessage({
  title,
  body,
}: Readonly<{ title: string; body: string }>) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p>{body}</p>
    </div>
  );
}
