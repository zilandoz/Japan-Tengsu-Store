import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();
const packSizes = [1, 2, 3, 5, 10];
const unitPrice = 30;
const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

function Home() {
  const [selectedPack, setSelectedPack] = useState(1);
  const [cartUnits, setCartUnits] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const cartTotal = cartUnits * unitPrice;

  useEffect(() => {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
    if (!configuredSiteUrl) return;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = `${configuredSiteUrl}/`;
    let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.append(ogUrl);
    }
    ogUrl.content = `${configuredSiteUrl}/`;
    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (ogImage) ogImage.content = `${configuredSiteUrl}/images/japan-tengsu-product.jpeg`;
    const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.content = `${configuredSiteUrl}/images/japan-tengsu-product.jpeg`;
  }, []);

  const addToCart = () => {
    setCartUnits((current) => current + selectedPack);
    setCartMessage(`${selectedPack} ${selectedPack === 1 ? 'bottle' : 'bottles'} added to your selection.`);
  };

  const clearCart = () => {
    setCartUnits(0);
    setCartMessage('Your selection has been cleared.');
  };

  const focusOrder = () => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Japan Tengsu, home" data-testid="link-home">
          <span className="mark" aria-hidden="true">日</span>
          <span className="brand-name">Japan Tengsu</span>
        </a>
        <nav className="header-links" aria-label="Main navigation">
          <a href="#product" data-testid="link-product-info">Product notes</a>
          <a href="#questions" data-testid="link-faq">Questions</a>
          <button className="cart-link" type="button" onClick={focusOrder} aria-label={`Selection, ${cartUnits} bottles`} data-testid="button-view-selection">
            <ShoppingBag size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>Selection</span>
            <span className="cart-count" data-testid="text-cart-count">{cartUnits}</span>
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <div className="eyebrow">Product record / 01</div>
            <h1 id="page-title">Japan<br /><em>Tengsu</em></h1>
            <p className="hero-lede">
              A considered product page for the item shown. Review the package image and the information we can verify before choosing a pack size.
            </p>
            <div className="hero-meta" aria-label="Product information at a glance">
              <span><i className="meta-dot" aria-hidden="true" /> Bottle format</span>
              <span><i className="meta-dot" aria-hidden="true" /> Pack sizes 1–10</span>
            </div>
            <a className="primary-link" href="#order" data-testid="link-choose-pack">
              Choose a pack <ArrowDownRight size={16} aria-hidden="true" />
            </a>
          </div>
          <figure className="hero-visual">
            <span className="vertical-index" aria-hidden="true">PACKAGING / FRONT VIEW</span>
            <span className="visual-halo" aria-hidden="true" />
            <img
              className="product-photo"
              src="/images/japan-tengsu-product.jpeg"
              alt="Japan Tengsu bottle beside its printed carton; the visible package includes the name JAPAN TENGSU and the text 0.5g / Tablet."
              width="478"
              height="382"
              fetchPriority="high"
              data-testid="img-japan-tengsu-product"
            />
            <figcaption className="image-caption">Package shown as supplied. Printed details may require confirmation.</figcaption>
          </figure>
        </section>

        <aside className="note-band" aria-label="Information note">
          <div className="note-band-inner">
            <span className="band-label">A note on accuracy</span>
            <p className="band-copy">The photo is a reference—not a substitute for a complete, legible product label.</p>
            <span className="band-mark" aria-hidden="true">—</span>
          </div>
        </aside>

        <section className="content-section" id="order" aria-labelledby="order-title">
          <div className="section-heading">
            <span className="section-index">01 / Select quantity</span>
            <div>
              <h2 id="order-title">Choose your<br />pack size.</h2>
              <p className="section-intro">Select a pack to see its total. Orders are by direct contact; the seller’s contact details will be added here once supplied. This page does not take payment.</p>
            </div>
          </div>
          <div className="purchase-grid">
            <div className="purchase-main">
              <span className="field-label" id="pack-size-label">Number of bottles <span className="field-note">Choose one option</span></span>
              <div className="pack-options" role="group" aria-labelledby="pack-size-label" data-testid="group-pack-sizes">
                {packSizes.map((size) => (
                  <button
                    className="pack-option"
                    type="button"
                    key={size}
                    aria-pressed={selectedPack === size}
                    onClick={() => {
                      setSelectedPack(size);
                      setCartMessage('');
                    }}
                    data-testid={`button-pack-${size}`}
                  >
                    <span className="pack-number">{size}</span>
                    <span className="pack-unit">{size === 1 ? 'bottle' : 'bottles'}</span>
                  </button>
                ))}
              </div>
            </div>
            <aside className="selection-card" aria-label="Current selection">
              <div className="selection-top">
                <span className="selection-title">Your selection</span>
                <span className="selection-unit" data-testid="text-selected-pack">{selectedPack} {selectedPack === 1 ? 'bottle' : 'bottles'}</span>
              </div>
              <div className="price-note">
                <strong data-testid="text-unit-price">{formatPrice(unitPrice)} USD / bottle</strong>
                <p>Pack total: <strong data-testid="text-pack-total">{formatPrice(selectedPack * unitPrice)} USD</strong>. Delivery costs, if any, are not included.</p>
              </div>
              <button className="add-button" type="button" onClick={addToCart} data-testid="button-add-selection">
                <span>Add to selection</span><ArrowRight size={16} aria-hidden="true" />
              </button>
              <p className="cart-status" role="status" aria-live="polite" data-visible={cartMessage.length > 0} data-testid="status-cart">{cartMessage || (cartUnits > 0 ? `${cartUnits} ${cartUnits === 1 ? 'bottle' : 'bottles'} in your selection — ${formatPrice(cartTotal)} USD.` : 'No bottles selected yet.')}</p>
              {cartUnits > 0 && <p className="cart-status" data-testid="text-cart-total">Selection total: <strong>{formatPrice(cartTotal)} USD</strong></p>}
              {cartUnits > 0 && (
                <button className="clear-selection" type="button" onClick={clearCart} data-testid="button-clear-selection">
                  Clear selection
                </button>
              )}
            </aside>
          </div>
        </section>

        <section className="details-section" id="product" aria-labelledby="details-title">
          <div className="details-inner">
            <div className="details-layout">
              <div className="details-aside">
                <span className="section-index">02 / Read the label</span>
                <h2 id="details-title">What the photo<br />can—and can’t—tell us.</h2>
                <p className="aside-copy">We’ve kept this record to details visible in the supplied photograph. Anything that cannot be read or independently confirmed is left open rather than guessed.</p>
              </div>
              <div className="fact-list" aria-label="Visible product details">
                <div className="fact-row">
                  <span className="fact-key">Name shown</span>
                  <span className="fact-value">“JAPAN TENGSU” is printed on the carton and bottle label.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Package format</span>
                  <span className="fact-value">One bottle and one carton are pictured. The carton includes the text “0.5g / Tablet”; the photo alone does not establish a full count or serving details.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Ingredients</span>
                  <span className="fact-value">A complete ingredient list is not legible in this image. Please rely on a full package label and verified product documentation.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Origin & maker</span>
                  <span className="fact-value">The bottle label appears to include “MADE IN JAPAN.” This is package wording visible in the photo, not independent verification of origin or place of production; the maker is not confirmed.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Use & safety</span>
                  <span className="fact-value">No directions, suitability, or safety information can be confirmed from this view. Check the complete label and consult an appropriate professional if you have questions.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Product status</span>
                  <span className="fact-value">Price shown is USD $30 per bottle. Orders are by direct contact; seller contact details are not yet listed. This page does not process a purchase.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section" id="questions" aria-labelledby="faq-title">
          <div className="faq-heading">
            <span className="section-index">03 / Common questions</span>
            <h2 id="faq-title">Clear answers.<br />No guesswork.</h2>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary>What is Japan Tengsu?</summary>
              <div className="faq-answer"><p>Japan Tengsu is the name printed on the product package shown on this page. The available photo does not verify the product’s composition, classification, intended use, or other claims.</p></div>
            </details>
            <details className="faq-item">
              <summary>What ingredients does it contain?</summary>
              <div className="faq-answer"><p>The ingredient panel is not readable in the supplied image. We have not inferred ingredients from the product name or other package wording. Check a complete, legible label and verified documentation before making a decision.</p></div>
            </details>
            <details className="faq-item">
              <summary>What does “0.5g / Tablet” mean on the carton?</summary>
              <div className="faq-answer"><p>That text is visible on the photographed carton. The image does not provide enough context to interpret it as a tablet weight, serving amount, or another specification. Confirm the meaning with the complete product labeling.</p></div>
            </details>
            <details className="faq-item">
              <summary>Where is this product made?</summary>
              <div className="faq-answer"><p>The bottle label appears to say “MADE IN JAPAN.” We can report that visible package wording, but the photograph does not independently verify origin or manufacturing location.</p></div>
            </details>
            <details className="faq-item">
              <summary>Is there safety or usage information?</summary>
              <div className="faq-answer"><p>Directions, warnings, and suitability details are not sufficiently legible in this photograph. Refer to the full original label and seek advice from a qualified professional for questions about use or safety.</p></div>
            </details>
            <details className="faq-item">
              <summary>Can I place or pay for an order here?</summary>
              <div className="faq-answer"><p>Orders are intended to be placed by contacting the seller. The contact details are not yet listed on this page, and pack selection does not create an order or take payment. The displayed total is based on USD $30 per bottle; delivery costs, if any, are not included.</p></div>
            </details>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="wordmark" href="#top" data-testid="link-footer-home"><span className="mark" aria-hidden="true">日</span><span className="footer-brand">Japan Tengsu</span></a>
        <p className="footer-note">Product details are limited to what is visible in the supplied image. Price is USD $30 per bottle; orders are by direct contact, with seller contact details to be added.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary resetKey="home">
          <Home />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
