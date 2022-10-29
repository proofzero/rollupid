/**
 * @file app/shared/components/MetricBox/index.tsx
 */

// DisplayMetric
// -----------------------------------------------------------------------------

type DisplayMetricProps = {
  // Current metric value
  value: number,
  // Last metric value
  last: number,
  // Metric display name
  name: string,
};

const DisplayMetric = (props: DisplayMetricProps) => {
  const current = props.value;
  const last = props.last;
  const delta = Math.round((current - last) / last * 100);
  const upArrow = '↑';
  const downArrow = '↓'
  const directionArrow = (delta > 0) ? upArrow : downArrow;
  const bgColor = (delta > 0) ? 'bg-lime-200' : 'bg-red-200';
  const arrowColor = (delta > 0) ? 'text-lime-500' : 'text-red-500';
  return (
    <div className="bg-white text-slate-500 text-sm w-full p-2">
      <div className="font-bold">{props.name}</div>
      <div className="flex flex-row items-center">
        <div className="flex-none mr-2 text-2xl font-bold text-indigo-500">{Intl.NumberFormat('en-US').format(current)}</div>
        <div className="flex-auto text-slate-500">from {Intl.NumberFormat('en-US').format(last)}</div>
        <div className={`flex-none ${bgColor} text-center text-lime-600 px-2 rounded-lg`}><span className={`${arrowColor} font-bold`}>{directionArrow}</span> {delta}%</div>
      </div>
    </div>
  );
};

// MetricBox
// -----------------------------------------------------------------------------

type MetricBoxProps = {

};

export default function MetricBox(props: MetricBoxProps) {
  return (
    <div className="flex flex-col items-center mb-2 gap-2 md:flex-row md:justify-between">
      <DisplayMetric name="Dummy Metric 1" value={71897} last={70946} />
      <DisplayMetric name="Dummy Metric 2" value={22343} last={11333} />
      <DisplayMetric name="Dummy Metric 3" value={57332} last={78346} />
    </div>
  );
}
