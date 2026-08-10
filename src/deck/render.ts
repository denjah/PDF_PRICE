import type {
  AssetRef,
  Badge,
  BrandImageSlide,
  ChampionshipsSlide,
  ClosingSlide,
  CoverSlide,
  DeckDefinition,
  DeckSlide,
  DistributorSlide,
  EngineeringSlide,
  Feature,
  Metric,
  Parameter,
  ProductHeroSlide,
  SpecsSlide,
  SportGallerySlide,
  UspSlide,
} from './types'

const preventHangingShortWords = (value: string): string => {
  return value.replace(/(?<![\p{L}\p{N}])(?:([\p{L}\p{N}]{1,2})|([ВвКкСсУуОоАаИи]|[Нн]а|[Нн]е|[Оо]т|[Дд]о|[Пп]о|[Ии]з|[Зз]а|[Нн]о|[Тт]о|[Лл]и|[Дд]а|[Пп]од))\s+/gu, '$1$2\u00a0')
}

const escapeHtml = (value: string): string =>
  preventHangingShortWords(value).replace(
    /[&<>'"]/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[char] ?? char,
  )

const renderImage = (
  asset: AssetRef,
  className = '',
  eager = false,
): string => `
  <img
    class="${escapeHtml(className)}"
    src="${escapeHtml(asset.src)}"
    alt="${escapeHtml(asset.alt)}"
    loading="${eager ? 'eager' : 'lazy'}"
    decoding="async"
    ${eager ? 'fetchpriority="high"' : ''}
    style="--wb-object-position: ${escapeHtml(asset.focalPoint ?? 'center')}"
  />
`

const renderTitle = (slide: DeckSlide): string => {
  const { copy } = slide
  const accent = copy.titleAccent
    ? `<span class="wb-accent">${escapeHtml(copy.titleAccent)}</span>`
    : ''

  return `
    ${copy.eyebrow ? `<p class="wb-eyebrow wb-anim">${escapeHtml(copy.eyebrow)}</p>` : ''}
    <h2 class="wb-title wb-title--h2 wb-anim">
      ${escapeHtml(copy.title)}${accent ? `<br />${accent}` : ''}
    </h2>
    ${copy.subtitle ? `<p class="wb-sub wb-anim">${escapeHtml(copy.subtitle)}</p>` : ''}
    ${copy.body ? `<p class="wb-body wb-anim">${escapeHtml(copy.body)}</p>` : ''}
  `
}

const renderParameters = (params: Parameter[]): string => `
  <div class="wb-params wb-anim">
    ${params
      .map(
        (param, index) => `
          ${index > 0 ? '<span class="wb-params__divider" aria-hidden="true"></span>' : ''}
          <div class="wb-params__col">
            <span class="wb-params__label">${escapeHtml(param.label)}</span>
            <span class="wb-params__value">${escapeHtml(param.value)}</span>
          </div>
        `,
      )
      .join('')}
  </div>
`

const renderFeatures = (features: Feature[]): string => `
  <ul class="wb-features wb-anim">
    ${features
      .map(
        (feature) => `
          <li>
            <span class="wb-features__dot" aria-hidden="true"></span>
            <span><strong>${escapeHtml(feature.title)}.</strong> ${escapeHtml(feature.body)}</span>
          </li>
        `,
      )
      .join('')}
  </ul>
`

const renderMetrics = (metrics: Metric[]): string => `
  <div class="wb-metrics wb-anim">
    ${metrics
      .map(
        (metric) => `
          <div class="wb-metric">
            <strong>${escapeHtml(metric.value)}</strong>
            <span>${escapeHtml(metric.label)}</span>
          </div>
        `,
      )
      .join('')}
  </div>
`

const renderBadges = (badges: Badge[]): string => `
  <div class="wb-badge-row wb-anim">
    ${badges.map((badge) => `<span class="wb-badge wb-badge--outline">${escapeHtml(badge.label)}</span>`).join('')}
  </div>
`

const renderFrame = (slide: DeckSlide, body: string, media: string): string => `
  <div class="wb-slide__grid">
    <div class="wb-slide__text">
      <div class="wb-slide__text-inner">${body}</div>
    </div>
    <div class="wb-slide__media">${media}</div>
  </div>
  <span class="wb-corner wb-corner--tr" aria-hidden="true"></span>
  <span class="wb-corner wb-corner--bl" aria-hidden="true"></span>
  <span class="wb-hairline-top" aria-hidden="true"></span>
  <span class="wb-hairline-bottom" aria-hidden="true"></span>
  <span class="wb-slide__index" aria-hidden="true">${escapeHtml(slide.id)}</span>
`

const renderCover = (slide: CoverSlide): string => {
  const hero = slide.media.find((asset) => asset.kind === 'image')
  const logo = slide.media.find((asset) => asset.kind === 'logo')
  const body = `
    ${logo ? `<div class="wb-brand-mark wb-anim">${renderImage(logo, 'wb-brand-mark__image', true)}</div>` : ''}
    <span class="wb-badge wb-anim">${escapeHtml(slide.badge)}</span>
    ${renderTitle(slide)}
    <hr class="wb-hline wb-anim" />
    ${renderParameters(slide.params)}
  `
  const media = hero ? `${renderImage(hero, 'wb-media-image', true)}<span class="wb-media-veil"></span>` : ''
  return `${renderFrame(slide, body, media)}<span class="wb-ghost" aria-hidden="true">VICTORY</span>`
}

const renderDistributor = (slide: DistributorSlide): string => {
  const hero = slide.media[0]
  const body = `${renderTitle(slide)}${renderMetrics(slide.metrics)}${renderFeatures(slide.features)}`
  return renderFrame(slide, body, hero ? `${renderImage(hero, 'wb-media-image')}<span class="wb-media-veil"></span>` : '')
}

const renderBrand = (slide: BrandImageSlide): string => {
  const hero = slide.media.find((asset) => asset.kind === 'image')
  const logo = slide.media.find((asset) => asset.kind === 'logo')
  const weekendLogo = slide.media.find((asset) => asset.id === 'weekend-logo-rasson')
  if (slide.id === 'rasson-brand') {
    return `
      <div class="wb-rasson-lockup">
        ${hero ? `<div class="wb-rasson-lockup__media" aria-hidden="true">${renderImage(hero, 'wb-rasson-lockup__media-image')}</div>` : ''}
        ${weekendLogo ? `<div class="wb-rasson-lockup__weekend wb-anim">${renderImage(weekendLogo, 'wb-rasson-lockup__weekend-image')}</div>` : ''}
        <span class="wb-rasson-lockup__line wb-anim"></span>
        ${logo ? `<div class="wb-rasson-lockup__logo wb-anim">${renderImage(logo, 'wb-rasson-lockup__logo-image')}</div>` : ''}
        <p class="wb-rasson-lockup__caption wb-anim">Официальный дистрибьютор RASSON в России</p>
      </div>
      <span class="wb-hairline-top" aria-hidden="true"></span>
      <span class="wb-hairline-bottom" aria-hidden="true"></span>
    `
  }
  return `
    ${hero ? `<div class="wb-full-media">${renderImage(hero, 'wb-media-image')}<span class="wb-full-media__veil"></span></div>` : ''}
    <div class="wb-brand-story">
      ${logo ? `<div class="wb-brand-mark wb-anim">${renderImage(logo, 'wb-brand-mark__image')}</div>` : ''}
      ${renderTitle(slide)}
      ${renderMetrics(slide.metrics)}
    </div>
    <span class="wb-hairline-top" aria-hidden="true"></span>
    <span class="wb-hairline-bottom" aria-hidden="true"></span>
  `
}

const renderProductHero = (slide: ProductHeroSlide): string => {
  const body = `${renderTitle(slide)}<hr class="wb-hline wb-anim" />${renderParameters(slide.params)}`
  const hero = slide.media[0]
  return renderFrame(slide, body, hero ? `${renderImage(hero, 'wb-media-image wb-media-image--contain')}<span class="wb-glow-orb"></span>` : '')
}

const renderUsp = (slide: UspSlide): string => {
  const [hero, ...details] = slide.media.filter((asset) => asset.kind === 'image')
  const logo = slide.media.find((asset) => asset.kind === 'logo')
  const body = `
    ${logo ? `<div class="wb-technology-logo wb-anim">${renderImage(logo, `wb-technology-logo__image ${logo.id === 'klematch-logo' ? 'wb-technology-logo__image--klematch' : ''}`)}</div>` : ''}
    ${renderTitle(slide)}
    ${slide.badges ? renderBadges(slide.badges) : ''}
    ${renderFeatures(slide.features)}
  `
  const isMosaic = slide.id === 'usp-adamath' || slide.id === 'usp-level-box'
  const mosaicAssets = [hero, ...details].filter(Boolean) as AssetRef[]
  const media = isMosaic ? `
    <div class="wb-usp-mosaic">
      ${[0, 1, 2, 3]
        .map((index) => {
          const asset = mosaicAssets[index]
          return !asset
            ? `<figure class="wb-usp-mosaic__item wb-usp-mosaic__item--${index + 1} wb-usp-mosaic__item--empty" aria-hidden="true"></figure>`
            : `<figure class="wb-usp-mosaic__item wb-usp-mosaic__item--${index + 1}">${renderImage(asset, 'wb-usp-mosaic__image')}<figcaption>${escapeHtml(asset.alt)}</figcaption></figure>`
        })
        .join('')}
    </div>
    <span class="wb-media-veil"></span>
  ` : `
    <div class="wb-usp-media wb-usp-media--details-${details.length}">
      ${hero ? `<div class="wb-usp-media__hero">${renderImage(hero, 'wb-media-image wb-media-image--contain')}</div>` : ''}
      ${details.length ? `<div class="wb-usp-media__details">${details
        .map(
          (asset) => `<figure class="wb-usp-detail">${renderImage(asset, 'wb-usp-detail__image')}<figcaption>${escapeHtml(asset.alt)}</figcaption></figure>`,
        )
        .join('')}</div>` : ''}
    </div>
    <span class="wb-media-veil"></span>
  `
  return renderFrame(slide, body, media)
}

const renderEngineering = (slide: EngineeringSlide): string => {
  const body = `${renderTitle(slide)}${renderFeatures(slide.features)}`
  const media = `
    <div class="wb-macro-grid">
      ${slide.media
        .map(
          (asset) => `
            <figure class="wb-macro">
              ${renderImage(asset, 'wb-macro__image')}
              <figcaption class="wb-macro__label">${escapeHtml(asset.alt)}</figcaption>
            </figure>
          `,
        )
        .join('')}
    </div>
  `
  return renderFrame(slide, body, media)
}

const renderSpecs = (slide: SpecsSlide): string => {
  const image = slide.media[0]
  const rows = slide.rows
    .map(
      (row) => `
        <tr>
          <th scope="row">${escapeHtml(row.label)}</th>
          ${slide.options
            .map((option) => {
              const value = row.values[option.id]
              return `<td>${value === null ? '<span class="wb-specs__missing">Уточняется</span>' : escapeHtml(String(value))}</td>`
            })
            .join('')}
        </tr>
      `,
    )
    .join('')
  const body = `
    <div class="wb-specs-copy">${renderTitle(slide)}</div>
    <div class="wb-specs-wrap wb-anim">
      <table class="wb-specs">
        <thead><tr><th>Параметр</th>${slide.options.map((option) => `<th>${escapeHtml(option.label)}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
  const media = image ? `${renderImage(image, 'wb-media-image wb-media-image--ghosted')}` : ''
  return renderFrame(slide, body, media)
}

const renderChampionships = (slide: ChampionshipsSlide): string => {
  const hero = slide.media.find((asset) => asset.kind === 'image')
  const logos = slide.media.filter((asset) => asset.kind === 'logo')
  const events = `<div class="wb-event-list wb-anim">${slide.events.map((event) => `<span>${escapeHtml(event)}</span>`).join('')}</div>`
  return `
    ${hero ? `<div class="wb-full-media">${renderImage(hero, 'wb-media-image')}<span class="wb-full-media__veil wb-full-media__veil--strong"></span></div>` : ''}
    <div class="wb-championship-copy">
      ${renderTitle(slide)}
      <div class="wb-certifications wb-anim">${logos.map((logo) => renderImage(logo, 'wb-certification-logo')).join('')}</div>
      ${renderBadges(slide.badges)}
      ${events}
    </div>
    <span class="wb-hairline-top" aria-hidden="true"></span>
    <span class="wb-hairline-bottom" aria-hidden="true"></span>
  `
}

const renderSportGallery = (slide: SportGallerySlide): string => `
  <div class="wb-sport-gallery">
    ${slide.media.map((asset, index) => `<figure class="wb-sport-gallery__item wb-sport-gallery__item--${index + 1}">${renderImage(asset, 'wb-sport-gallery__image')}<figcaption>${escapeHtml(asset.alt)}</figcaption></figure>`).join('')}
  </div>
  <div class="wb-sport-gallery__copy">${renderTitle(slide)}</div>
  <span class="wb-hairline-top" aria-hidden="true"></span><span class="wb-hairline-bottom" aria-hidden="true"></span>
`

const renderClosing = (slide: ClosingSlide): string => {
  const hero = slide.media.find((asset) => asset.kind === 'image')
  const logo = slide.media.find((asset) => asset.kind === 'logo')
  const actions = `
    <div class="wb-actions wb-anim">
      ${slide.actions
        .map((action) => `<a class="wb-btn-cta wb-btn-cta--${action.kind}" href="${escapeHtml(action.href)}"><span>${escapeHtml(action.label)}</span></a>`)
        .join('')}
    </div>
  `
  const contacts = `
    <address class="wb-contacts wb-anim">
      ${slide.contacts.map((contact) => `<a href="${escapeHtml(contact.href)}"><span>${escapeHtml(contact.label)}</span>${escapeHtml(contact.value)}</a>`).join('')}
    </address>
  `
  return `
    ${hero ? `<div class="wb-full-media">${renderImage(hero, 'wb-media-image')}<span class="wb-full-media__veil wb-full-media__veil--closing"></span></div>` : ''}
    <div class="wb-closing-copy">
      ${logo ? `<div class="wb-brand-mark wb-anim">${renderImage(logo, 'wb-brand-mark__image')}</div>` : ''}
      ${renderTitle(slide)}
      ${renderFeatures(slide.features)}
      ${actions}
      ${contacts}
    </div>
    <span class="wb-hairline-top" aria-hidden="true"></span>
    <span class="wb-hairline-bottom" aria-hidden="true"></span>
  `
}

const renderSlideContent = (slide: DeckSlide): string => {
  switch (slide.archetype) {
    case 'cover-weekend':
      return renderCover(slide)
    case 'distributor':
      return renderDistributor(slide)
    case 'brand-image':
      return renderBrand(slide)
    case 'product-hero':
      return renderProductHero(slide)
    case 'usp':
      return renderUsp(slide)
    case 'engineering':
      return renderEngineering(slide)
    case 'specs':
      return renderSpecs(slide)
    case 'championships':
      return renderChampionships(slide)
    case 'sport-gallery':
      return renderSportGallery(slide)
    case 'closing-cta':
      return renderClosing(slide)
  }
}

export const renderDeckSlide = (slide: DeckSlide, index: number): string => `
  <section
    id="${escapeHtml(slide.id)}"
    class="wb-slide wb-slide--${escapeHtml(slide.archetype)} ${index % 2 === 1 && slide.archetype !== 'specs' ? 'wb-slide--reverse' : ''} wb-noise"
    data-wb-slide="${escapeHtml(slide.id)}"
    data-wb-archetype="${escapeHtml(slide.archetype)}"
    aria-label="Слайд ${index + 1}: ${escapeHtml(slide.copy.title)}"
  >
    ${renderSlideContent(slide)}
  </section>
`

const assertDeck = (deck: DeckDefinition): void => {
  if (!deck.slug || !Array.isArray(deck.slides) || deck.slides.length === 0) {
    throw new Error('Deck definition is invalid')
  }
}

export const mountDeck = (root: HTMLElement, deck: DeckDefinition): void => {
  assertDeck(deck)
  document.documentElement.dataset.wbTheme = deck.theme
  document.documentElement.dataset.wbVariant = deck.variant
  document.title = `${deck.title} — Weekend Billiard`

  const slides = deck.slides.filter((slide) => slide.enabled)
  root.innerHTML = `
    <main class="wb-deck" aria-label="${escapeHtml(deck.title)}" tabindex="0">
      ${slides.map(renderDeckSlide).join('')}
    </main>
    <nav class="wb-chrome" aria-label="Навигация по презентации">
      <div class="wb-theme-toggle" aria-label="Цветовая тема">
        <button type="button" data-wb-home-variant="dark">Dark</button>
        <button type="button" data-wb-home-variant="light">Light</button>
      </div>
      <span class="wb-counter" aria-live="polite"><strong>01</strong> / ${String(slides.length).padStart(2, '0')}</span>
      <div class="wb-dots" role="tablist" aria-label="Слайды">
        ${slides
          .map(
            (_, index) => `<button type="button" role="tab" aria-label="Перейти к слайду ${index + 1}" data-wb-go="${index}" ${index === 0 ? 'aria-selected="true"' : 'aria-selected="false"'}></button>`,
          )
          .join('')}
      </div>
      <div class="wb-nav-buttons">
        <button type="button" data-wb-prev aria-label="Предыдущий слайд">←</button>
        <button type="button" data-wb-next aria-label="Следующий слайд">→</button>
      </div>
    </nav>
  `

  const deckElement = root.querySelector<HTMLElement>('.wb-deck')
  const slideElements = [...root.querySelectorAll<HTMLElement>('.wb-slide')]
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-wb-go]')]
  const counter = root.querySelector<HTMLElement>('.wb-counter strong')
  const previous = root.querySelector<HTMLButtonElement>('[data-wb-prev]')
  const next = root.querySelector<HTMLButtonElement>('[data-wb-next]')
  const themeButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-wb-home-variant]')]

  if (!deckElement || slideElements.length === 0 || !counter || !previous || !next) {
    throw new Error('Deck controls could not be mounted')
  }

  let activeIndex = 0

  const setActive = (index: number): void => {
    activeIndex = Math.max(0, Math.min(index, slideElements.length - 1))
    slideElements.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeIndex))
    dots.forEach((dot, dotIndex) => dot.setAttribute('aria-selected', String(dotIndex === activeIndex)))
    counter.textContent = String(activeIndex + 1).padStart(2, '0')
    previous.disabled = activeIndex === 0
    next.disabled = activeIndex === slideElements.length - 1
  }

  const goTo = (index: number): void => {
    const target = Math.max(0, Math.min(index, slideElements.length - 1))
    slideElements[target]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(target)
  }

  dots.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.wbGo))))
  themeButtons.forEach((button) => button.addEventListener('click', () => {
    const variant = button.dataset.wbHomeVariant as 'dark' | 'light'
    document.documentElement.dataset.wbTheme = 'home'
    document.documentElement.dataset.wbVariant = variant
    themeButtons.forEach((item) => item.classList.toggle('is-active', item === button))
    const params = new URLSearchParams(window.location.search)
    params.set('theme', 'home')
    params.set('variant', variant)
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
  }))
  previous.addEventListener('click', () => goTo(activeIndex - 1))
  next.addEventListener('click', () => goTo(activeIndex + 1))

  deckElement.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault()
      goTo(activeIndex + 1)
    }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault()
      goTo(activeIndex - 1)
    }
    if (event.key === 'Home') goTo(0)
    if (event.key === 'End') goTo(slideElements.length - 1)
  })

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(slideElements.indexOf(visible.target as HTMLElement))
    },
    { root: deckElement, threshold: [0.55, 0.75] },
  )

  slideElements.forEach((slide) => observer.observe(slide))
  setActive(0)
  themeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.wbHomeVariant === document.documentElement.dataset.wbVariant))
  deckElement.focus({ preventScroll: true })
}
