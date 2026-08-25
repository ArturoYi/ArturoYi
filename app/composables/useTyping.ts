/**
 * 逐字打出文本。尊重 prefers-reduced-motion，卸载时清理定时器。
 */
export const useTyping = (text: MaybeRefOrGetter<string>, speed = 100) => {
  const displayedText = ref("");
  const isDone = ref(false);
  const fullText = computed(() => toValue(text));

  let index = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const stopTyping = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startTyping = () => {
    stopTyping();
    displayedText.value = "";
    isDone.value = false;
    index = 0;

    const source = fullText.value;
    if (!source) {
      isDone.value = true;
      return;
    }

    if (import.meta.client && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      displayedText.value = source;
      isDone.value = true;
      return;
    }

    timer = setInterval(() => {
      if (index < source.length) {
        displayedText.value += source.charAt(index);
        index++;
        return;
      }

      stopTyping();
      isDone.value = true;
    }, speed);
  };

  onMounted(() => {
    startTyping();
  });

  onUnmounted(() => {
    stopTyping();
  });

  return { displayedText, isDone, startTyping };
};
