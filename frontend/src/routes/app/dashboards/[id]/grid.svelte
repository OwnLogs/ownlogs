<script lang="ts">
  import type { Card } from '$lib/server/db/dashboard';
  import { flip } from 'svelte/animate';
  import CardComponent from './card.svelte';
  import { cn } from '$lib/utils';

  const dragDuration = 300;
  let {
    cards = $bindable([]),
    onSwap,
    deleteCard,
    onCardsEdit
  }: {
    cards: Card[];
    onSwap?: (cards: Card[]) => void;
    deleteCard: (card: Card) => void;
    onCardsEdit: () => void;
  } = $props();
  let draggingCard: Card | null = $state(null);
  let animatingCards: Set<Card> = $state(new Set());

  function swapWith(card: Card): void {
    if (!draggingCard || draggingCard === card || animatingCards.has(card)) return;
    animatingCards.add(card);
    setTimeout(() => animatingCards.delete(card), dragDuration);
    const cardAIndex = cards.indexOf(draggingCard);
    const cardBIndex = cards.indexOf(card);
    cards[cardAIndex] = card;
    cards[cardBIndex] = draggingCard;
  }

  function onDragStart(card: Card): void {
    draggingCard = card;
  }

  function onDragEnd(): void {
    if (onSwap) onSwap(cards);
    draggingCard = null;
  }

  function onEditCard(): void {
    if (onCardsEdit) onCardsEdit();
  }

  const colSpans = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3'
  };
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
  {#each cards as card, i (card.id)}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      animate:flip={{ duration: dragDuration }}
      ondragenter={() => swapWith(card)}
      ondragover={(e) => e.preventDefault()}
      class={cn(colSpans[card.colSpan ?? 1])}
    >
      <CardComponent {onDragStart} {onDragEnd} bind:card={cards[i]} {deleteCard} {onEditCard} />
    </div>
  {/each}
</div>
