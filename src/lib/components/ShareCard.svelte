<script lang="ts">
    export let title = 'OPEN MAKING';
    export let description = 'open source resources for learning code and other miscellany';
    export let count = 0;
    export let countType = 'courses';
    export let pageType = 'home';

    $: bgColor = '#1a1a2e';
    $: textColor = '#eee';
    $: accentColor = '#ffc107';
    $: primaryColor = '#ff6b6b';
    $: linkColor = '#4fc3f7';
    $: borderColor = '#333';
</script>

<div
    style="display: flex; width: 1200px; height: 627px; color: {textColor}; font-family: 'JetBrains Mono', monospace; position: relative; background-color: {bgColor};"
>
    <div
        style="display: flex; flex-direction: column; flex: 1; width: 100%; height: 100%; position: relative; padding: 60px 120px; border: 4px solid {borderColor}; box-shadow: 0 8px 0 0 {borderColor}, 0 8px 20px 0 rgba(238, 238, 238, 0.3); "
    >
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display: flex; align-items: center;">
                <span style="color: {primaryColor}; font-size: 24px; margin-right: 12px;">▸</span>
                <span
                    style="font-size: 20px; font-weight: bold; text-transform: uppercase; color: {textColor}; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px;"
                >{pageType === 'webring' ? 'webring --list' : 'ls -la courses/'}</span>
            </div>
            <div style="display: flex;">

            </div>
        </div>

        <div
            style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; align-items: flex-start;"
        >
            <div style="display: flex; text-align: left;">
                <span
                    style="font-size: 72px; font-weight: bold; line-height: 1.1; max-width: 90%; text-shadow: 2px 2px 0 {borderColor}; color: {accentColor}; text-transform: uppercase; letter-spacing: 3px;">{title}</span>
            </div>
            <div style="display: flex; text-align: left; margin-top: 0px;">
                <span
                    style="font-size: 32px; color: {textColor}; line-height: 1.3; max-width: 80%;">{description}</span>
            </div>
        </div>

        <div
            style="display: flex; justify-content: space-between; align-items: center; border-top: 4px solid {borderColor}; padding-top: 20px; margin: 0 -20px -20px -20px; padding: 20px; border-radius: 0 0 8px 8px;"
        >
            <div style="display: flex; align-items: center;">
                <span style="color: {linkColor}; font-size: 36px; font-weight: bold; margin-right: 16px;">
                    {count}
                </span>
                <span style="color: {textColor}; font-size: 28px;">
                    {countType} {pageType === 'webring' ? 'connected' : ''}
                </span>
            </div>
            <div style="display: flex;">
                <span
                    style="font-size: 28px; font-weight: bold; color: {textColor}; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px;"
                    >openmaking.club{pageType === 'webring' ? '/webring' : ''}</span>
            </div>
        </div>
    </div>
</div>