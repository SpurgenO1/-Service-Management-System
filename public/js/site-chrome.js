/**
 * TechServe — SparxIT-style chrome: top bar + nav + expanded footer
 * <body data-page="home|about|services|contact|auth">
 */
(function () {
  const headerMount = document.getElementById('site-header-mount');
  const footerMount = document.getElementById('site-footer-mount');
  if (!headerMount && !footerMount) return;

  const active = document.body.dataset.page || 'home';

  const linkClass = (name) =>
    'nav-link px-3' + (active === name ? ' active fw-semibold' : '');

  const header = `
  <header class="site-header-shell fixed-top w-100">
    <div class="sparx-topbar d-none d-md-block">
      <div class="container d-flex flex-wrap justify-content-between align-items-center py-1">
        <span>Ready to streamline service delivery? <a href="/contact.html">Let’s talk</a></span>
        <span class="d-flex gap-3">
          <a href="mailto:support@techserve.com">support@techserve.com</a>
          <a href="tel:+18005550199">+1 (800) 555-0199</a>
        </span>
      </div>
    </div>
    <nav class="navbar site-navbar navbar-expand-lg">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-3 py-0" href="/index.html">
          <img class="brand-logo" src="/images/techserve-logo.svg" alt="TechServe" width="40" height="40">
          <span class="text-start">
            <span class="brand-text d-block lh-sm">TechServe</span>
            <small class="d-block text-muted fw-semibold" style="font-size:0.65rem; letter-spacing:0.12em;">SERVICE MANAGEMENT</small>
          </span>
        </a>
        <button class="navbar-toggler shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav" aria-controls="siteNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="siteNav">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li class="nav-item"><a class="${linkClass('home')}" href="/index.html">Home</a></li>
            <li class="nav-item"><a class="${linkClass('services')}" href="/services.html">Services</a></li>
            <li class="nav-item"><a class="${linkClass('about')}" href="/about.html">Who we are</a></li>
            <li class="nav-item"><a class="${linkClass('contact')}" href="/contact.html">Contact</a></li>
            <li class="nav-item ms-lg-3">
              <a class="btn btn-brand btn-sm px-3 rounded-pill" href="/auth.html">Client portal</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>`;

  const ctaBand = `
  <section class="tcs-cta-band" aria-labelledby="cta-heading">
    <div class="container px-4">
      <h2 id="cta-heading">Partner for measurable delivery outcomes</h2>
      <p>From first request to QA sign-off—one platform, clear ownership, and clients who always know what’s next.</p>
      <a href="/contact.html" class="btn btn-brand rounded-pill px-4">Contact us</a>
      <a href="/auth.html" class="btn btn-brand-outline rounded-pill px-4 ms-2 mt-2 mt-sm-0">Open portal</a>
    </div>
  </section>`;

  const footer = `
  ${ctaBand}
  <footer class="site-footer">
    <div class="container py-5">
      <div class="row g-4 g-lg-5">
        <div class="col-lg-3 col-md-6">
          <div class="d-flex align-items-center gap-2 mb-3">
            <img class="brand-logo brand-logo--sm" src="/images/techserve-logo.svg" alt="" width="32" height="32">
            <span class="brand-text">TechServe</span>
          </div>
          <p class="text-footer-muted small mb-3">Digital service delivery with traceable workflows, QA gates, and a client portal built for transparency.</p>
        </div>
        <div class="col-6 col-lg-2 col-md-3">
          <h6 class="footer-heading text-uppercase small fw-bold letter-spacing mb-3">Services</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="/services.html#build" class="link-footer">Development</a></li>
            <li class="mb-2"><a href="/services.html#stability" class="link-footer">Bug fixing</a></li>
            <li class="mb-2"><a href="/services.html#care" class="link-footer">Maintenance</a></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2 col-md-3">
          <h6 class="footer-heading text-uppercase small fw-bold letter-spacing mb-3">Company</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="/about.html" class="link-footer">About us</a></li>
            <li class="mb-2"><a href="/contact.html" class="link-footer">Contact</a></li>
            <li class="mb-2"><a href="/auth.html" class="link-footer">Client portal</a></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2 col-md-3">
          <h6 class="footer-heading text-uppercase small fw-bold letter-spacing mb-3">Platform</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="/auth.html" class="link-footer">Sign in</a></li>
            <li class="mb-2"><a href="/auth.html" class="link-footer">Register</a></li>
          </ul>
        </div>
        <div class="col-lg-3 col-md-6">
          <h6 class="footer-heading text-uppercase small fw-bold letter-spacing mb-3">Get in touch</h6>
          <p class="text-footer-muted small mb-1">support@techserve.com</p>
          <p class="text-footer-muted small mb-0">+1 (800) 555-0199</p>
          <p class="text-footer-muted small mt-2 mb-0">Mon–Fri, 8:00–18:00 EST</p>
        </div>
      </div>
      <hr class="my-4" style="border-color: var(--border); opacity: 1;">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-footer-muted">
        <span>© ${new Date().getFullYear()} TechServe Systems. All rights reserved.</span>
        <span>Service management &amp; software delivery</span>
      </div>
    </div>
  </footer>`;

  if (headerMount) headerMount.innerHTML = header;
  if (footerMount) footerMount.innerHTML = footer;
})();
