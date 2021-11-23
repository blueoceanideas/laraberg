<?php

namespace VanOns\Laraberg\Models;

use Illuminate\Database\Eloquent\Model;
use VanOns\Laraberg\Events\ContentCreated;
use VanOns\Laraberg\Events\ContentRendered;
use VanOns\Laraberg\Events\ContentUpdated;
use VanOns\Laraberg\Helpers\BlockHelper;
use VanOns\Laraberg\Helpers\EmbedHelper;

class Content extends Model
{
    protected $table = 'lb_contents';

    public static function boot(): void
    {
        parent::boot();

        static::created(function ($model): void {
            event(new ContentCreated($model));
        });

        static::updated(function ($model): void {
            event(new ContentUpdated($model));
        });
    }

    public function contentable()
    {
        return $this->morphTo();
    }

    /**
     * Returns the rendered content of the content
     * @return String - The completely rendered content
     */
    public function render()
    {
        $html = BlockHelper::renderBlocks($this->rendered_content);

        event(new ContentRendered($this));

        return "<div class='gutenberg__content wp-embed-responsive markup'>$html</div>";
    }

    public function setContent(string $html): void
    {
        $this->raw_content = $this->fixEmptyImages($html);
        $this->renderRaw();
    }

    /**
     * Renders the HTML of the content object
     */
    public function renderRaw(): string
    {
        $this->rendered_content = EmbedHelper::renderEmbeds($this->raw_content);

        event(new ContentRendered($this));

        return $this->rendered_content;
    }

    /**
     * TODO: Remove this temporary fix for Image block crashing when no image is selected
     */
    private function fixEmptyImages($html)
    {
        $regex = '/<img(.*)\/>/';

        return preg_replace_callback($regex, function ($matches) {
            if (isset($matches[1]) && strpos($matches[1], 'src="') === false) {
                return str_replace('<img ', '<img src="/vendor/laraberg/img/placeholder.jpg" ', $matches[0]);
            }

            return $matches[0];
        }, $html);
    }
}
