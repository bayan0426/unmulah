import { getVerifiedSignAsset } from '../data/sign-assets';

export function FingerspellingViewer({ text }: { text: string }) {
  return (
    <section className="fingerspelling-viewer" aria-label="عرض هجائي بصري للحروف">
      <div className="fingerspelling-viewer-heading"><div><h2>الهجاء الإصبعي للنص</h2><p>يعرض هذا المكان أصولًا إشارية موثّقة عند توفرها. لا يمثل ترجمةً لمعاني القرآن.</p></div><span className="coming-soon">قريبًا</span></div>
      <div className="fingerspelling-tokens" dir="rtl">
        {Array.from(text).map((character, index) => {
          if (/\s/.test(character)) return <span className="fingerspelling-gap" key={`gap-${index}`} aria-label="فاصل كلمة" />;
          const asset = getVerifiedSignAsset(character);
          return <article className="fingerspelling-token" key={`${character}-${index}`}>
            {asset ? <img src={asset.assetPath} alt={asset.attribution} /> : <div className="sign-asset-placeholder" aria-hidden="true">{character}</div>}
            <strong>{character}</strong>
            {!asset && <span>المرجع الإشاري قريبًا</span>}
          </article>;
        })}
      </div>
    </section>
  );
}
