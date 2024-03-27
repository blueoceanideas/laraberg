<?php

namespace VanOns\Laraberg\Helpers;

use Embed\Embed;
use Embed\Extractor;

class EmbedHelper
{
    /**
     * Renders any embeds in the HTML
     */
    public static function renderEmbeds(string $html): string
    {
        return preg_replace_callback('/<!-- wp:embed.*?-->\s*?<figure class="wp-block-embed.*?".*?<div class="wp-block-embed__wrapper">\s*?(.*?)\s*?<\/div>.*?<\/figure>/', function (array $matches): string {
            $embed = self::create($matches[1]);
            $url = preg_replace('/\//', '\\/', preg_quote($matches[1]));

            // Lazy load iframes
            $embedCodeWithLazyLoad = str_replace('<iframe', '<iframe loading="lazy"', $embed->code?->html);

            return preg_replace("/>\s*?{$url}\s*?</", ">{$embedCodeWithLazyLoad}<", $matches[0]);
        }, $html);
    }

    /**
     * Transforms the Embed/Embed object to a format that Gutenberg can handle
     * @param Extractor $embed
     * @return array
     */
    public static function serialize(Extractor $embed): array
    {
        return [
            'url' => $embed->url,
            'author_name' => $embed->authorName,
            'author_url' => $embed->authorUrl,
            'html' => $embed->code?->html,
            'width' => $embed->code?->width,
            'height' => $embed->code?->height,
            'type' => $embed->getOEmbed()->get('type'),
            'provider_name' => $embed->providerName,
            'provider_url' => $embed->providerUrl,
        ];
    }

    /**
     * Creates an embed from a URL
     */
    public static function create(string $url): Extractor
    {
        $embed = new Embed();
        $embed->setSettings([
            'oembed:query_parameters' => [
                'maxwidth' => 1024,
                'maxheight' => 600,
            ],
        ]);

        $url = trim($url);

        return $embed->get($url);
    }
}
