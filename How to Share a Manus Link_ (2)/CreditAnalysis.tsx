                    <span className="text-gray-500 text-base font-normal">{tier.period}</span>
                  </p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded mt-2">
                    {tier.rounds}
                  </span>
                </div>
                
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {selectedTier === tier.id && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Upgrade to {tiers.find(t => t.id === selectedTier)?.name} - {tiers.find(t => t.id === selectedTier)?.price}/mo
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto text-center text-sm text-gray-500 px-4">
          <p className="mb-2">
            DisputeStrike is dispute automation software, not a credit repair service. 
            Results vary and are not guaranteed.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/terms"><a className="hover:text-orange-600">Terms of Service</a></Link>
            <Link href="/privacy"><a className="hover:text-orange-600">Privacy Policy</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
