import LightboxComponent from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Props { src: string; alt?: string; onClose: () => void; }

export default function Lightbox({ src, alt, onClose }: Props) {
  return (
    <LightboxComponent
      open={true}
      close={onClose}
      slides={[{ src, alt }]}
      carousel={{ finite: true }}
      render={{ buttonPrev: () => null, buttonNext: () => null }}
    />
  );
}
