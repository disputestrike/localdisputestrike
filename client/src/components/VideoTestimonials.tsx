import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star } from "lucide-react";

interface VideoTestimonial {
  id: number;
  displayName: string;
  videoUrl: string;
  thumbnailUrl: string;
  videoDuration: number;
  scoreBefore: number;
  scoreAfter: number;
  scoreIncrease: number;
  accountsDeleted: number;
  testimonialText: string;
  isFeatured: boolean;
}

interface VideoTestimonialsProps {
  testimonials: VideoTestimonial[];
  featured?: boolean; // Show only featured video
}

export function VideoTestimonials({ testimonials, featured = false }: VideoTestimonialsProps) {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const displayTestimonials = featured
    ? testimonials.filter(t => t.isFeatured).slice(0, 1)
    : testimonials;

  if (displayTestimonials.length === 0) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={featured ? "space-y-4" : "grid md:grid-cols-2 lg:grid-cols-3 gap-6"}>
      {displayTestimonials.map((testimonial) => (
        <Card key={testimonial.id} className={featured ? "border-2 border-green-200" : ""}>
          <CardContent className="p-0">
            {/* Video Thumbnail/Player */}
            <div className="relative aspect-video bg-black group cursor-pointer">
              {playingVideo === testimonial.id ? (
                <video
                  src={testimonial.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onEnded={() => setPlayingVideo(null)}
                />
              ) : (
                <>
                  <img
                    src={testimonial.thumbnailUrl || '/placeholder-video.jpg'}
                    alt={`${testimonial.displayName} testimonial`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => setPlayingVideo(testimonial.id)}
                      className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Play className="h-8 w-8 text-blue-600 ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(testimonial.videoDuration)}
                  </div>
                </>
              )}
            </div>

            {/* Testimonial Info */}
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{testimonial.displayName}</span>
                    {testimonial.isFeatured && (
                      <Badge className="bg-yellow-500 text-xs">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <Badge className="bg-green-600">
                  +{testimonial.scoreIncrease} pts
                </Badge>
              </div>

              {/* Score Display */}
              {featured && (
                <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{testimonial.scoreBefore}</div>
                    <div className="text-xs text-gray-500">Before</div>
                  </div>
                  <div className="text-2xl text-green-600">→</div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{testimonial.scoreAfter}</div>
                    <div className="text-xs text-gray-500">After</div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{testimonial.accountsDeleted} deleted</span>
                <span>•</span>
                <span>{testimonial.scoreBefore} → {testimonial.scoreAfter}</span>
              </div>

              {/* Testimonial Text */}
              {featured && (
                <p className="text-sm text-gray-700 italic line-clamp-3">
                  "{testimonial.testimonialText}"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Featured Video Hero Section Component
export function FeaturedVideoHero({ testimonial }: { testimonial: VideoTestimonial }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-green-600">Real Success Story</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See How {testimonial.displayName} Increased Their Credit Score by {testimonial.scoreIncrease} Points
            </h2>
            <p className="text-lg text-gray-600">
              Watch their journey from {testimonial.scoreBefore} to {testimonial.scoreAfter} with {testimonial.accountsDeleted} negative accounts deleted
            </p>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
            {isPlaying ? (
              <video
                src={testimonial.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <>
                <img
                  src={testimonial.thumbnailUrl || '/placeholder-video.jpg'}
                  alt={`${testimonial.displayName} testimonial`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                  >
                    <Play className="h-10 w-10 text-blue-600 ml-1" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Stats Below Video */}
          <div className="grid grid-cols-3 gap-6 mt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">+{testimonial.scoreIncrease}</div>
              <div className="text-sm text-gray-600">Point Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{testimonial.accountsDeleted}</div>
              <div className="text-sm text-gray-600">Accounts Deleted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{testimonial.scoreAfter}</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
