import { renderToString } from 'hono/jsx/dom/server';
import _languages from './languages.json' with { type: 'json' };

interface Language {
  label: string;
  image: string;
  timeFor: number;
  color: string;
}

async function fileToDataURI(filePath: string) {
  const file = Bun.file(filePath);
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = file.type || 'application/octet-stream';
  const dataURI = `data:${mimeType};base64,${base64String}`;
  return dataURI;
}

function Balls(languages: Language[]) {
  const rowHeight = 54;
  const barX = 52;
  const barWidth = 256;
  const ballRadius = 26;
  const ballTravel = 600;

  return (
    <svg width='100%' height={languages.length * rowHeight + 6} xmlns='http://www.w3.org/2000/svg'>
      {/* <rect width='100%' height='100%' fill='black' /> */}
      {languages.map((lang, index) => {
        const yOffset = index * rowHeight + 4;
        const ballCy = yOffset + rowHeight / 2;
        const ballCx = barX + barWidth + ballRadius;
        const duration = (lang.timeFor / 1000).toFixed(2);

        return (
          <g key={lang.label}>
            <image href={lang.image} x='6' y={yOffset} width={40} height={50} style='filter: drop-shadow(rgba(0, 0, 0, 0.314) 2px 2px 2px);' />
            <rect x={barX} y={yOffset} width={barWidth} height='50' fill='#444' style='filter: drop-shadow(rgba(0, 0, 0, 0.145) 2px 2px 2px);' />
            <text x={64} y={yOffset + 30} fontSize='18' fill='#fff' fontFamily='monospace'>
              {lang.label}
            </text>
            <circle
              cx={ballCx}
              cy={ballCy}
              r={ballRadius}
              fill={lang.color}
              stroke='#444'
              stroke-width='1'
              style='filter: drop-shadow(rgba(0, 0, 0, 0.145) 2px 2px 2px);'
            >
              <animateTransform
                attributeName='transform'
                type='translate'
                values={`0 0; ${ballTravel} 0; 0 0`}
                dur={`${duration}s`}
                repeatCount='indefinite'
                keyTimes='0; 0.5; 1'
                calcMode='linear'
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

const languages = _languages as Language[];
for (const lang of languages) {
  lang.image = await fileToDataURI(lang.image);
}

const svgElement = Balls(languages);
const svg = renderToString(svgElement);
await Bun.write('out/balls.svg', svg);
